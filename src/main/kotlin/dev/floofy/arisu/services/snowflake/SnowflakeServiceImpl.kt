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

package dev.floofy.arisu.services.snowflake

import dev.floofy.arisu.Constants
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

// Credit: https://github.com/KyokoBot/kyoko/blob/master/shared/src/main/java/moe/kyokobot/shared/util/SnowflakeGen.java
class SnowflakeServiceImpl: SnowflakeService {
    private val increment: AtomicInteger = AtomicInteger()
    private val lastMs: AtomicLong = AtomicLong()
    private val pid: Long = ProcessHandle.current().pid()

    override fun generate(): Long {
        val current = System.currentTimeMillis()
        if (lastMs.get() != current) {
            lastMs.set(current)
            increment.set(0)
        }

        return ((current - Constants.EPOCH_TIME) shl 22
                or ((pid.toInt() shl 12 and 0x3ff).toLong())
                or (increment.getAndIncrement() and 0xfff).toLong())
    }
}
