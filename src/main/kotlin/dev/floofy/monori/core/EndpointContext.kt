package dev.floofy.monori.core

import dev.floofy.monori.extensions.end
import io.vertx.core.http.HttpServerRequest
import io.vertx.core.http.HttpServerResponse
import io.vertx.core.json.JsonObject

class EndpointContext(
    val session: Any?,
    val request: HttpServerRequest,
    val response: HttpServerResponse
) {

    /**
     * Send an empty payload
     */
    fun end() = response.setStatusCode(204).end()

    /**
     * Closes the response with a status code and a JSON object
     * @param statusCode The status code to use
     * @param body The body to pass down
     */
    fun send(statusCode: Int, body: JsonObject) = response.setStatusCode(statusCode).end(body)
}
