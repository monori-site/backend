package dev.floofy.monori.core

import io.vertx.core.http.HttpMethod
import io.vertx.core.http.HttpServerRequest
import io.vertx.core.http.HttpServerResponse

/**
 * Represents a endpoint to use
 * @param path The path to use, append <code>/</code> to make it into a route
 * @param method The HTTP method to use, this is dependant on the CORS module
 * @param version The version number it uses, this is good for versioning the service
 */
abstract class Endpoint(
    val path: String,
    val method: HttpMethod,
    val version: Int = 1
) {

    /**
     * Runs this [Endpoint] and returns a value
     * @param req The request from the routing context
     * @param res The response from the routing context
     */
    abstract fun run(req: HttpServerRequest, res: HttpServerResponse)

}
