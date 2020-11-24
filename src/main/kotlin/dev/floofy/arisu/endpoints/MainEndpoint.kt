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

package dev.floofy.arisu.endpoints

import dev.floofy.arisu.components.Endpoint
import dev.floofy.arisu.extensions.*
import dev.floofy.arisu.services.redis.RedisService
import io.vertx.core.http.HttpMethod
import io.vertx.core.http.HttpServerRequest
import io.vertx.core.http.HttpServerResponse
import io.vertx.core.json.JsonObject
import java.util.*

class MainEndpoint: Endpoint("/", HttpMethod.GET) {
    override fun run(req: HttpServerRequest, res: HttpServerResponse) =
        res.setStatusCode(400).end(JsonObject().apply {
            put("message", "welcome!!! :D")
        })
}

class CreateTestEndpoint(private val redis: RedisService): Endpoint("/put/:name", HttpMethod.GET) {
    override fun run(req: HttpServerRequest, res: HttpServerResponse) {
        val nameParam = req.getParam("name")
        redis.client.set(nameParam, "E")

        return res.setStatusCode(200).end("E")
    }
}

class RetriveEntityEndpoint(private val redis: RedisService): Endpoint("/retrive/:name", HttpMethod.GET) {
    override fun run(req: HttpServerRequest, res: HttpServerResponse) {
        val nameParam = req.getParam("name")
        val value = redis.client.get(nameParam)

        println(value)
        return res.setStatusCode(200).end("E")
    }
}
