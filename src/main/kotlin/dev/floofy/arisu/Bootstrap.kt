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

package dev.floofy.arisu

import dev.floofy.arisu.extensions.createThread
import dev.floofy.arisu.extensions.getISOString
import dev.floofy.arisu.modules.*
import org.koin.core.context.startKoin
import org.slf4j.Logger
import org.slf4j.LoggerFactory

object Bootstrap {
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    @JvmStatic
    fun main(args: Array<String>) {
        Thread.currentThread().name = "Arisu-BootstrapThread"
        logger.info("Bootstrapping...")

        startKoin {
            environmentProperties()
            modules(arisuModule, endpointsModule, componentsModule, servicesModule)
        }

        val app = Arisu()
        app.init()

        Runtime.getRuntime().addShutdownHook(createThread("Arisu-ShutdownThread") {
            logger.warn("Received shutdown, disposing.")
            app.destroy()
        })
    }
}
