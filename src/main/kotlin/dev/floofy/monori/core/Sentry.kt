package dev.floofy.monori.core

import io.sentry.Sentry as SentryCore
import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * Represents a class for handling Sentry errors, if enabled
 * @param config The configuration to use
 * @param version The version of the backend service
 */
class Sentry(
    private val config: Any,
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
    val isEnabled: Boolean = false

    /**
     * Installs this [Sentry] instance and populate taas
     */
    fun install() {
        if (!isEnabled) {
            logger.warn("Sentry DSN not populated! This is optional but recommended.")
            return
        }

        // do shizzle here owo
        logger.info("Installing Sentry...")
        SentryCore.init {
            it.environment = "development"
            it.release = version
            it.dsn = "some dsn"
        }

        // configure tags
        SentryCore.configureScope { scope ->
            scope.setTag("project.version.kotlin", KotlinVersion.CURRENT.toString())
            scope.setTag("project.version.java", System.getProperty("java.version") ?: "Unknown")
            scope.setTag("project.environment", "development")
            scope.setTag("project.version", version)
        }

        logger.info("Sentry should be installed! Assuming you populated everything... which I doubt.")
    }

    fun report(error: Throwable) {
        if (!isEnabled) return

        SentryCore.captureException(error)
    }
}
