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

package dev.floofy.arisu.services.redis

import dev.floofy.arisu.data.Configuration
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import redis.clients.jedis.Jedis

class RedisService(private val config: Configuration) {
    lateinit var client: Jedis
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    fun init() {
        logger.info("Now connecting to Redis...")

        val jedis = Jedis(config.redis.host, config.redis.port)
        jedis.connect()

        if (config.redis.password != null) jedis.auth(config.redis.password)
        if (config.redis.db > 0) jedis.select(config.redis.db)

        logger.info("Attempted to connect to Redis, assuming it worked")
        client = jedis
    }

    fun close() {
        logger.warn("Attempting to close Redis instance")
        client.close()
    }
}
