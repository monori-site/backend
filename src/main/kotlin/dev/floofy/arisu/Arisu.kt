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

package dev.floofy.arisu

import dev.floofy.arisu.components.Endpoint
import dev.floofy.arisu.components.RequestHandler
import dev.floofy.arisu.data.Configuration
import io.vertx.core.Vertx
import io.vertx.ext.web.Router
import org.koin.core.KoinComponent
import org.koin.core.inject
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class Arisu: KoinComponent {
    private val requestHandler: RequestHandler by inject()
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)
    private val config: Configuration by inject()
    private val vertx: Vertx by inject()

    /**
     * Initialises all components and runs the service
     */
    fun init() {
        // Set the current thread name
        Thread.currentThread().name = "Arisu-MainStartupThread"

        logger.info("Initialising Arisu...")
        val router = Router.router(vertx)
        val routes = getKoin().getAll<Endpoint>()

        logger.info("Found ${routes.size} endpoints! Now installing...")
        for (endpoint in routes) {
            logger.info("Found endpoint \"${endpoint.method} ${endpoint.path}\"")
            router
                .route(endpoint.method, endpoint.path)
                .failureHandler { ctx -> requestHandler.onFailure(ctx, endpoint) }
                .blockingHandler({ ctx -> requestHandler.handle(ctx, endpoint) }, false)
        }

        router.errorHandler(404, requestHandler::onNotFound)
        router.errorHandler(405, requestHandler::onMethodNotAllowed)

        logger.info("All routing has been setup, now loading components...")

        // database.connect()
        // mongodb.connect()
        // sentry.install()
        // redis.connect()

        logger.info("Assuming that all components has been installed, now creating server")
        val server = vertx.createHttpServer()
        server
            .requestHandler(router)
            .listen(config.port)

        logger.info("Server should be pointed at http://localhost:${config.port}, assuming you did stuff correctly.")

        // sessions.reapply()
    }

    /**
     * Destroys this [Arisu] instance
     */
    fun destroy() {
        logger.info("Destroying instance.")

        // sessions.destroy()
        // database.disconnect()
        // mongo.disconnect()
        // redis.disconnect()
        vertx.close()
    }
}
