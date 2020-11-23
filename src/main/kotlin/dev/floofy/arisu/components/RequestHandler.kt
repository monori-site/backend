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

package dev.floofy.arisu.components

import dev.floofy.arisu.extensions.end
import io.vertx.core.json.JsonObject
import io.vertx.ext.web.RoutingContext
import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * The request handler for handling concurrent requests
 */
class RequestHandler {
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    fun onNotFound(ctx: RoutingContext) {
        val response = ctx.response()
        val request = ctx.request()

        response.setStatusCode(404).end(JsonObject().apply {
            put("message", "Route \"${request.rawMethod()} ${request.path()}\" was not found in this context, are you lost?")
        })
    }

    fun onMethodNotAllowed(ctx: RoutingContext) {
        val request = ctx.request()
        val res = ctx.response()

        res.setStatusCode(405).end(JsonObject().apply {
            put("message", "Route \"${request.rawMethod()} ${request.path()}\" was not a valid method to use, did you mix up the http method?")
        })
    }

    fun onFailure(ctx: RoutingContext, endpoint: Endpoint) {
        val throwable = ctx.failure()
        val res = ctx.response()

        logger.error("Unable to run route \"${endpoint.method} ${endpoint.path}\":")
        println(throwable)

        val obj = JsonObject().apply {
            put("error", throwable.localizedMessage)
            put("notice", "If this error keeps occurring, please add it to out issue board! https://github.com/arisuland/Arisu/issues")
        }

        res.setStatusCode(500).end(obj)
    }

    fun handle(ctx: RoutingContext, endpoint: Endpoint) {
        logger.info("Received a request on \"${endpoint.method} ${endpoint.path}\"!")

        val request = ctx.request()
        val response = ctx.response()

        // Apply CORS and content type
        response
            .putHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE")
            .putHeader("Access-Control-Allow-Origin", "*")
            .putHeader("Content-Type", "application/json")

        // TODO: add query/path param validation, session validation
        // Now we run the endpoint
        endpoint.run(request, response)
    }
}
