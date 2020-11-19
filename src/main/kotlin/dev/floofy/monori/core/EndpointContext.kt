package dev.floofy.monori.core

import dev.floofy.monori.extensions.end
import io.vertx.core.http.HttpServerRequest
import io.vertx.core.http.HttpServerResponse
import io.vertx.core.json.JsonObject

class EndpointContext(
    val session: Any?,
    val params: Map<String, String>,
    val query: Map<String, String>,
    val body: JsonObject?,
    val req: HttpServerRequest,
    val res: HttpServerResponse
) {

    /**
     * Send an empty payload
     */
    fun end() = res.setStatusCode(204).end()

    /**
     * Closes the response with a status code and a JSON object
     * @param statusCode The status code to use
     * @param body The body to pass down
     */
    fun send(statusCode: Int, body: JsonObject) = res.setStatusCode(statusCode).end(body)
}
