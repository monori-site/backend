package dev.floofy.monori

import io.vertx.ext.web.Router
import dev.floofy.monori.data.Config
import io.vertx.core.Vertx
import org.koin.core.KoinComponent
import org.koin.core.inject
import org.slf4j.*

class Monori: KoinComponent {
    private val config: Config by inject()
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)
    private val server: Vertx by inject()

    init {
        // Set the thread to "Monori-MainThread"
        Thread.currentThread().name = "Monori-MainThread"
        logger.info("Initialising backend service...")

        // The global router to use, then we'll use
        // instances of dev.floofy.monori.routing.Router
        // to inject to this global router
        val router = Router.router(server)
    }
}
