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
package dev.floofy.monori.managers

import dev.floofy.monori.data.Application
import dev.floofy.monori.data.Config
import dev.floofy.monori.data.Environment
import org.slf4j.LoggerFactory
import org.slf4j.Logger
import io.sentry.Sentry

/**
 * Represents a manager for handing Sentry errors within Monori,
 * if it's enabled it'll add the necessary tags.
 *
 * @param dsn The DSN to use, if it's <code>null</code>, it won't install
 * the manager.
 */
class SentryManager(
    private val config: Config,
    private val metadata: Application
) {

    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    /**
     * Returns if the sentry manager is enabled
     */
    val isEnabled: Boolean = config.sentryDSN != null

    /**
     * Installs this [SentryManager] and populates all tags
     */
    fun install() {
        if (!isEnabled) {
            logger.warn("Sentry DSN is not populated in the configuration, this is optional, yet recommended!")
            return
        }

        logger.info("Now installing Sentry...")
        Sentry.init {
            it.environment = config.environment.toString() // i think?
            it.release = "${metadata.version}@${metadata.commit}"
            it.dsn = config.sentryDSN
        }

        // Configure tags
        Sentry.configureScope { scope ->
            scope.setTag("project.version.kotlin", KotlinVersion.CURRENT.toString())
            scope.setTag("project.version.java", System.getProperty("java.version") ?: "unknown")
            scope.setTag("project.environment", config.environment.toString())
            scope.setTag("project.version", metadata.version)
        }

        logger.info("Sentry is now installed for this backend service!")
    }

    fun report(error: Throwable) {
        if (!isEnabled) return

        Sentry.captureException(error)
    }
}
