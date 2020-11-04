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
            logger.warn("Sentry DSN is not populated in the configuration, this is optional yet recommended!")
            return
        }

        logger.info("Now installing Sentry...")
        Sentry.init {
            it.environment = config.environment.toString() // i think?
            it.release = "${metadata.version}@${metadata.commit}"
            it.dsn = config.sentryDSN
        }

        logger.info("Sentry is now installed for this backend service!")
    }
}
