package dev.floofy.monori.handlers

import dev.floofy.monori.core.Endpoint
import dev.floofy.monori.core.EndpointContext
import dev.floofy.monori.extensions.createDaemonThread
import dev.floofy.monori.extensions.end
import io.vertx.core.json.JsonObject
import io.vertx.ext.web.RoutingContext
import kotlinx.coroutines.launch
import kotlinx.coroutines.GlobalScope
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

    // Handle all 404 requests
    fun handleNotFound(ctx: RoutingContext) {
        val res = ctx.response()
        val req = ctx.request()

        res
            .putHeader("Content-Type", "application/json")
            .putHeader("Powered-By", "Monori (https://github.com/monori-site/backend)")
            .putHeader("Access-Control-Allow-Orign", "*")
            .putHeader("Access-Control-Allow-Methods", CORS_METHODS)

        return res.setStatusCode(404).end(JsonObject().apply {
            put("message", "Path \"${req.rawMethod().toUpperCase()} ${req.path()}\" was not found in this context. Are you lost?")
        })
    }

    // Handle all 405 requests
    fun handleMethodNotAllowed(ctx: RoutingContext) {
        val res = ctx.response()
        val req = ctx.request()

        res
            .putHeader("Content-Type", "application/json")
            .putHeader("Powered-By", "Monori (https://github.com/monori-site/backend)")
            .putHeader("Access-Control-Allow-Orign", "*")
            .putHeader("Access-Control-Allow-Methods", CORS_METHODS)

        return res.setStatusCode(404).end(JsonObject().apply {
            put("message", "Path \"${req.rawMethod().toUpperCase()} ${req.path()}\" was not a valid endpoint, did you get stuck?")
        })
    }

    fun handle(ctx: RoutingContext, endpoint: Endpoint) {
        val res = ctx.response()
        val req = ctx.request()

        // Populate all headers
        res
            .putHeader("Powered-By", "Monori (https://github.com/monori-site/backend)")
            .putHeader("Access-Control-Allow-Orign", "*")
            .putHeader("Access-Control-Allow-Methods", CORS_METHODS)

        val context = EndpointContext(
            null,
            req,
            res
        )

        if (endpoint.queryParams.isNotEmpty()) {
            val required = endpoint.queryParams.filter { it.value }
            for ((key, _) in required) {
                val param = ctx.queryParam(key)
                if (param.isEmpty()) {
                    context.send(406, JsonObject().apply {
                        put("message", "Missing required query parameter: \"$key\"")
                    })

                    return
                }
            }
        }

        GlobalScope.launch {
            try {
                endpoint.run(context)
            } catch(ex: Exception) {
                context.send(500, JsonObject().apply {
                    put("message", "If this keeps occurring, contact the administrators.")
                    put("error", ex.localizedMessage)
                })
            }
        }
    }
}
