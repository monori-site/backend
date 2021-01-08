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

import dev.floofy.arisu.data.Config
import dev.floofy.arisu.endpoints.addMainEndpoints
import dev.floofy.arisu.modules.arisuModule
import dev.floofy.arisu.typings.arisu.errors.ErrorCodes
import dev.floofy.arisu.typings.arisu.errors.ErrorType
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.serialization.*
import io.ktor.util.*
import org.jetbrains.exposed.dao.exceptions.EntityNotFoundException
import org.koin.ktor.ext.Koin
import org.slf4j.LoggerFactory

// fun main(args: Array<String>) = io.ktor.server.netty.EngineMain.main(args)

/**
 * Module to install Arisu into ktor.
 */
@KtorExperimentalAPI
fun Application.arisu() {
    val config = Config(environment.config)
    val monitor = Monitors(environment)
    val logger by lazy { LoggerFactory.getLogger("dev.floofy.arisu.Application") }

    logger.info("Started monitors")
    monitor.start()

    // Installs Koin: DI Management
    install(Koin) {
        val appModule = org.koin.dsl.module {
            single { config }
        }

        modules(arisuModule, appModule)
    }

    // Adds custom status pages per exception we get
    install(StatusPages) {
        exception<EntityNotFoundException> {
            val error = ErrorType("Entity was not found", ErrorCodes.UNKNOWN_ENTITY)
            call.respond(HttpStatusCode.NotFound, error)
        }
    }

    // Installs kotlinx.serialization: Pass/Get data from data classes
    install(ContentNegotiation) {
        json()
    }

    // Installs Default Headers: Adds in default headers per-request
    install(DefaultHeaders) {
        header("X-Powered-By", "Arisu (https://github.com/arisuland/Arisu)")
    }

    // Installs CORS
    install(CORS) {
        header(HttpHeaders.XForwardedProto) // Expose X-Forwarded-Proto
        anyHost() // Let any host make requests
    }

    addMainEndpoints()
}
