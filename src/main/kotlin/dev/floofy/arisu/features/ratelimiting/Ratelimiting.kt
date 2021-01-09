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

import dev.floofy.arisu.Utils
import dev.floofy.arisu.typings.arisu.errors.ErrorCodes
import dev.floofy.arisu.typings.arisu.errors.Ratelimited
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.util.*
import java.time.Duration
import java.time.Instant

class Ratelimiting(
    internal val ratelimiter: Ratelimiter
) {
    class Configuration {
        val resetTime: Duration = Duration.ofHours(1L)
        val limit: Int = 1000
    }

    companion object Feature: ApplicationFeature<ApplicationCallPipeline, Configuration, Ratelimiting> {
        override val key: AttributeKey<Ratelimiting> = AttributeKey("Ratelimiting")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): Ratelimiting {
            val config = Configuration().apply(configure)
            val ratelimiter = Ratelimiter(config.limit.toLong(), config.resetTime)
            val feature = Ratelimiting(ratelimiter)

            pipeline
                .sendPipeline
                .intercept(ApplicationSendPipeline.After) {
                    val key = "ratelimits:${this.call.request.origin.remoteHost}"
                    val allowed = ratelimiter.isAllowed(key)
                    val record = ratelimiter.getRecord(key)

                    context.response.header("X-Ratelimit-Limit", config.limit)
                    context.response.header("X-Ratelimit-Remaining", record.remaining)
                    context.response.header("X-Ratelimit-Reset", record.resetsAt.epochSecond)
                    context.response.header("X-Ratelimit-Reset-Date", Utils.toISOString(record.resetsAt))
                    if (!allowed) {
                        val resetAfter = (record.resetsAt.epochSecond - Instant.now().epochSecond).coerceAtLeast(0)
                        context.response.header("Retry-After", resetAfter)
                        context.respond(HttpStatusCode.TooManyRequests, Ratelimited(
                            message = "IP ${this.call.request.origin.remoteHost} has been ratelimited, try again later.",
                            code = ErrorCodes.RATELIMITED
                        ))

                        finish()
                    } else {
                        proceed()
                    }
                }

            return feature
        }
    }
}
