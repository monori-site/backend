package dev.floofy.monori.extensions

import io.vertx.core.http.HttpServerResponse
import io.vertx.core.json.JsonArray
import io.vertx.core.json.JsonObject

/**
 * Ends the request using a [JsonObject] as the body to send to the client
 * @param chunk The [JsonObject] to apply the chunk to
 */
fun HttpServerResponse.end(chunk: JsonObject) = this.end(chunk.toString())

/**
 * Ends the request using a [JsonArray] as the body to send to the client
 * @param chunk The [JsonArray] to apply
 */
fun HttpServerResponse.end(chunk: JsonArray) = this.end(chunk.toString())
