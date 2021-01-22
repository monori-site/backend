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

package dev.floofy.arisu

import dev.floofy.arisu.extensions.createThread
import dev.floofy.arisu.extensions.getInt
import dev.floofy.arisu.kotlin.logging
import dev.floofy.arisu.services.snowflake.SnowflakeServiceImpl
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.util.*
import java.util.concurrent.TimeUnit
import kotlin.system.exitProcess
import org.slf4j.LoggerFactory

object Bootstrap {
    private val logger by logging(this::class.java)

    fun arisu_main(args: Array<String>) {
        Thread.currentThread().name = "Arisu-MainThread"
        val uwuEnv = applicationEngineEnvironment {
            val additional = commandLineEnvironment(args)
            val ktorConf = additional.config.config("ktor.deployment")

            this.developmentMode = true
            this.watchPaths = listOf("dev.floofy.arisu.Bootstrap.main")
            this.config = additional.config
            this.log = LoggerFactory.getLogger("dev.floofy.arisu.ktor.Application")

            connector {
                host = "0.0.0.0"
                port = ktorConf.property("port").getInt()
            }

            module {
                arisu()
            }
        }

        val server = embeddedServer(Netty, uwuEnv)
            .start(true)

        Runtime.getRuntime().addShutdownHook(createThread("Arisu-ShutdownThread") {
            logger.warn("Stopping server...")
            server.stop(1, 5, TimeUnit.SECONDS)
        })
    }

    @JvmStatic
    @KtorExperimentalAPI
    fun main(args: Array<String>) {
        val generator = SnowflakeServiceImpl(machineId = 10)
        println("Binary: ${generator.generateBinary()}")
        println("Snowflake: ${generator.generate()}")

        exitProcess(0)
    }
}
