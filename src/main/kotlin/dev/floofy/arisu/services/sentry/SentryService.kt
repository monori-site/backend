package dev.floofy.arisu.services.sentry

import dev.floofy.arisu.data.Configuration
import io.sentry.Sentry
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class SentryService(private val config: Configuration) {
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)
    private val enabled: Boolean
        get() = config.sentryDSN != null

    fun install() {
        if (!enabled) {
            logger.warn("Sentry isn't configured correctly it seems, this is optional -- yet recommended.")
            return
        }

        logger.info("Installing Sentry...")
        Sentry.init {
            it.environment = "development"
            it.release = "1.0.0-alpha.69@hash" // TODO: figure out a system for "ArisuInfo.kt"
            it.dsn = config.sentryDSN
        }

        Sentry.configureScope { scope ->
            scope.setTag("project.versions.kotlin", KotlinVersion.CURRENT.toString())
            scope.setTag("project.versions.arisu", "1.0.0-alpha.69")
            scope.setTag("project.versions.java", System.getProperty("java.version") ?: "Unknown")
        }

        logger.info("Installed Sentry successfully under DSN \"${config.sentryDSN}\"")
    }

    fun report(error: Throwable) {
        if (!enabled) return

        Sentry.captureException(error)
    }
}