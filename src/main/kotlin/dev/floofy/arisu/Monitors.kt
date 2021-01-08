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

import dev.floofy.arisu.extensions.env
import dev.floofy.arisu.kotlin.logging
import io.ktor.application.*

typealias Monitor = (Application) -> Unit

class Monitors(private val environment: ApplicationEnvironment) {
    private val logger by logging(this::class.java)

    private val onAppStopped: Monitor = { dispose() }
    private val onAppStarted: Monitor = {
        logger.info("Arisu has now started! Environment: ${it.env}")
    }

    private val onAppStart: Monitor = {
        logger.info("Arisu is now starting...")
    }

    fun start() {
        environment.monitor.subscribe(ApplicationStopped, onAppStopped)
        environment.monitor.subscribe(ApplicationStarting, onAppStart)
        environment.monitor.subscribe(ApplicationStarted, onAppStarted)
    }

    private fun dispose() {
        environment.monitor.unsubscribe(ApplicationStopped, onAppStopped)
        environment.monitor.unsubscribe(ApplicationStarting, onAppStart)
        environment.monitor.unsubscribe(ApplicationStarted, onAppStarted)
    }
}
