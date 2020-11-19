/**
 * Copyright (c) 2020 August
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

package dev.floofy.monori.core

import dev.floofy.monori.data.Config
import io.sentry.Sentry as SentryCore
import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * Represents a class for handling Sentry errors, if enabled
 * @param config The configuration to use
 * @param version The version of the backend service
 */
class Sentry(
    private val config: Config,
    private val version: String
) {

    /**
     * The logger for this [Sentry] instance
     */
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    /**
     * If it's enabled or not, it'll sliently not be used
     * if not enabled.
     */
    val enabled: Boolean = config.sentryDSN != null

    /**
     * Installs this [Sentry] instance and populate taas
     */
    fun install() {
        if (!enabled) {
            logger.warn("Sentry DSN not populated! This is optional but recommended.")
            return
        }

        // do shizzle here owo
        logger.info("Installing Sentry...")
        SentryCore.init {
            it.environment = "development"
            it.release = version
            it.dsn = config.sentryDSN
        }

        // configure tags
        SentryCore.configureScope { scope ->
            scope.setTag("project.version.kotlin", KotlinVersion.CURRENT.toString())
            scope.setTag("project.version.java", System.getProperty("java.version") ?: "Unknown")
            scope.setTag("project.environment", config.environment.toString())
            scope.setTag("project.version", version)
        }

        logger.info("Sentry should be installed! Assuming you populated everything... which I doubt.")
    }

    fun report(error: Throwable) {
        if (!enabled) return

        SentryCore.captureException(error)
    }
}
