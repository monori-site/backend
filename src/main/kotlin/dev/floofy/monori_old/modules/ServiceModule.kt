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

package dev.floofy.monori_old.modules

import dev.floofy.monori_old.data.Config
import io.vertx.core.Vertx
import io.vertx.core.VertxOptions
import io.vertx.ext.healthchecks.HealthCheckHandler
import io.vertx.ext.healthchecks.Status
import org.koin.dsl.module
import redis.clients.jedis.Jedis

val serviceModule = module {
    single {
        val config: Config = get()
        val opts = VertxOptions()
            .setWorkerPoolSize(config.workers)

        Vertx.vertx(opts)
    }

    single {
        val vertx: Vertx = get()
        val redis: Jedis = get()

        val health = HealthCheckHandler.create(vertx)

        // Service
        health.register("service", 5000) {
            it.complete(Status.OK())
        }

        // Redis
        health.register("redis") {
            val res = redis.ping()
            it.complete(if (res == null) Status.KO() else Status.OK())
        }

        // MongoDB

        // PostgreSQL

        health
    }
}
