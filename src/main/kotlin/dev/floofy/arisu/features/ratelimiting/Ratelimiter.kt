/**
 * Copyright (c) 2020-2021 Arisu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package dev.floofy.arisu.features.ratelimiting

import dev.floofy.arisu.kotlin.logging
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

data class Ratelimit(
    val remaining: Long,
    val resetsAt: Instant
) {
    fun consume(): Ratelimit =
        if (hasExceeded()) this else this.copy(remaining = remaining - 1L)

    fun hasExceeded(): Boolean =
        this.remaining <= 0L

    fun shouldReset(): Boolean =
        resetsAt <= Instant.now()

    fun resetIfNeeded(limit: Long, resetTime: Duration): Ratelimit =
        if (shouldReset()) Ratelimit(limit, Instant.now().plus(resetTime)) else this
}

/**
 * This is a forked version of project "ktor-rate-limiting" (https://github.com/mantono/ktor-rate-limiting)
 *
 * This adds in more customizable options and suits for Arisu's needs
 */
class Ratelimiter(
    val limit: Long = 1000,
    val resetTime: Duration = Duration.ofHours(1),
    initialSize: Int = 69
) {
    private val lastPurge: Instant = Instant.now()
    private val logger by logging(this::class.java)
    private val records: ConcurrentHashMap<String, Ratelimit> = ConcurrentHashMap(initialSize)

    fun getRecord(key: String): Ratelimit {
        records.compute(key) { _, rate ->
            val present = rate?.resetIfNeeded(limit, resetTime) ?: getDefault()
            present.consume()
        }

        if (shouldPurge()) purgeRecords()

        return records[key]!!
    }

    fun isAllowed(key: String): Boolean =
        getRemaining(key) > 0 || shouldReset(key)

    fun resetsAt(key: String): Instant =
        records[key]?.resetsAt ?: Instant.now().plus(resetTime)

    fun shouldReset(key: String): Boolean =
        resetsAt(key) <= Instant.now()

    private fun reset(key: String) {
        records[key] = getDefault()
    }

    private fun getDefault(): Ratelimit =
        Ratelimit(1000, Instant.now())

    fun getRemaining(key: String): Long =
        records[key]?.remaining ?: limit

    private fun shouldPurge(): Boolean =
        records.size > 1000 && lastPurgeAt() > Duration.ofMinutes(20L)

    private fun lastPurgeAt(): Duration =
        Duration.between(lastPurge, Instant.now())

    private fun purgeRecords() {
        logger.debug("Now purging records...")
        records.filter { it.value.shouldReset() }.keys.forEach { records.remove(it) }
    }
}
