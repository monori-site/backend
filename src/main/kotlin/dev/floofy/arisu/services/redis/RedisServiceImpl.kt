/**
 * Copyright (c) 2020-2021 Arisu
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

package dev.floofy.arisu.services.redis

import dev.floofy.arisu.data.Config
import dev.floofy.arisu.kotlin.logging
import io.ktor.util.*
import io.lettuce.core.RedisClient
import io.lettuce.core.api.StatefulConnection

@KtorExperimentalAPI
class RedisServiceImpl(private val config: Config): RedisService {
    override lateinit var connection: StatefulConnection<String, String>
    private lateinit var client: RedisClient
    private val logger by logging(this::class.java)

    override fun connect() {
        logger.info("Now connecting to Redis...")
        val redisUrl = if (config.redis.password != null) {
            "redis://${config.redis.password}@${config.redis.host}:${config.redis.port}/${config.redis.db}"
        } else {
            "redis://${config.redis.host}:${config.redis.port}/${config.redis.db}"
        }

        client = RedisClient.create(redisUrl)
        connection = client.connect()

        logger.info("Connected to Redis")
    }

    override fun close() {
        logger.warn("Closing connection with Redis...")

        connection.close()
        client.shutdown()
    }
}
