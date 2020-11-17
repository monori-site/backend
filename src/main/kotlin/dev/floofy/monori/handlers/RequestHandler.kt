package dev.floofy.monori.handlers

import dev.floofy.monori.extensions.createDaemonThread
import io.vertx.ext.web.RoutingContext
import kotlinx.coroutines.CoroutineDispatcher
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Represents a [RequestHandler] to handle all requests incoming
 * from the API. This handles ratelimiting and CORS responses.
 */
class RequestHandler {

    /**
     * List of CORS methods to use
     */
    private val CORS_METHODS: String = "GET,POST,DELETE,PATCH,PUT"

    /**
     * The executor service to run when dispatching new pools
     */
    private val pool: ExecutorService by lazy {
        Executors.newCachedThreadPool {
            createDaemonThread("Monori-RequestHandler-ExecutorThread", it)
        }
    }

    fun handle(ctx: RoutingContext) {

    }

}
