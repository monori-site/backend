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

package dev.floofy.arisu.services.sentry

import dev.floofy.arisu.data.Config
import dev.floofy.arisu.kotlin.logging
import io.ktor.util.*
import io.sentry.Sentry

@KtorExperimentalAPI
class SentryServiceImpl(private val config: Config): SentryService {
    override val enabled: Boolean = config.sentryDSN != null
    private val logger by logging(this::class.java)

    override fun install() {
        if (!enabled) {
            logger.warn("`arisu.sentry` was not specified in configuration, skipping")
            return
        }

        logger.info("Installing Sentry...")
        Sentry.init {
            it.release = "0.0.0_0"
            it.dsn = config.sentryDSN
        }

        Sentry.configureScope {
            it.setTag("project.versions.kotlin", KotlinVersion.CURRENT.toString())
            it.setTag("project.versions.arisu", "1.0.0-indev.0")
            it.setTag("project.versions.java", System.getProperty("java.version") ?: "<unknown>")
        }

        logger.info("Sentry has been installed. I hope so, you never know o_O")
    }

    override fun report(ex: Throwable) {
        if (!enabled) return

        Sentry.captureException(ex)
    }
}
