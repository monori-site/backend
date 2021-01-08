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

package dev.floofy.arisu.data

import dev.floofy.arisu.extensions.getInt
import io.ktor.config.*
import io.ktor.util.*

@KtorExperimentalAPI
class Config(config: ApplicationConfig) {
    val docsUrl = config.propertyOrNull("arisu.docsUrl")?.getString() ?: "docs.arisu.land"
    val emiUrl = config.propertyOrNull("arisu.emiUrl")?.getString()

    val database = PostgresConfig(
        username = config.propertyOrNull("arisu.database.username")?.getString() ?: "postgres",
        password = config.property("arisu.database.password").getString(),
        database = config.propertyOrNull("arisu.database.name")?.getString() ?: "arisu",
        host = config.propertyOrNull("arisu.database.host")?.getString() ?: "localhost",
        port = config.propertyOrNull("arisu.database.port")?.getInt() ?: 5432
    )
}
