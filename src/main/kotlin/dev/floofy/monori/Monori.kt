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
package dev.floofy.monori

import io.vertx.ext.web.Router
import dev.floofy.monori.data.Config
import dev.floofy.monori.managers.SentryManager
import dev.floofy.monori.managers.SessionManager
import dev.floofy.monori.routing.Route
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.ext.healthchecks.HealthCheckHandler
import org.koin.core.KoinComponent
import org.koin.core.inject
import org.slf4j.*
import redis.clients.jedis.Jedis

class Monori: KoinComponent {
    //private val sessions: SessionManager by inject()
    private val health: HealthCheckHandler by inject()
    private val config: Config by inject()
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)
    private val server: Vertx by inject()
    private val sentry: SentryManager by inject()
    private val redis: Jedis by inject()

    fun start() {
        // Set the thread to "Monori-MainThread"
        Thread.currentThread().name = "Monori-MainThread"
        logger.info("Initialising backend service...")

        // The global router to use, then we'll use
        // instances of dev.floofy.monori.routing.Router
        // to inject to this global router
        val router = Router.router(server)
        val routes = getKoin().getAll<Route>()

        // Inject the health checker
        router
            .route("/health")
            .handler(health)

        // Now we load all routes to the global router
        logger.info("Found ${routes.size} routes available")
        routes.forEach { route ->
            logger.info("Found \"${route.method.name} ${route.path}\" to load.")
            router
                .route(route.method, route.path)
                .failureHandler { ctx ->
                    val throwable = ctx.failure()
                    val res = ctx.response()
                    val statusCode = ctx.statusCode()

                    logger.error("Unable to run route \"${route.method.name} ${route.path}\":")
                    logger.error(throwable.toString())

                    val obj = JsonObject().apply {
                        put("error", res.statusMessage)
                    }

                    sentry.report(throwable)
                    res.setStatusCode(statusCode).end(obj.toString())
                }.blockingHandler({ ctx ->
                    route.run(ctx)
                }, false)
        }

        // Installs Sentry
        sentry.install()

        // Loads all databases
        redis.connect()
        // mongo.connect()
        // db.connect()

        // Loads up the HTTP service
        val http = server.createHttpServer()
        http.requestHandler(router)

        http.listen(config.port)
        logger.info("Monori is now binded at http://localhost:${config.port}!")

        // sessions.reapply()
    }

    fun destroy() {
        redis.disconnect()
        server.close()
    }
}
