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
package dev.floofy.monori_old.core

import java.lang.RuntimeException
import java.time.Duration
import java.time.Instant

class Stopwatch {
    private lateinit var startTime: Instant
    private lateinit var endTime: Instant
    var isRunning: Boolean = false

    fun start() {
        if (isRunning) throw RuntimeException("Stopwatch is already running")

        isRunning = true
        startTime = Instant.now()
    }

    fun stop(): Duration {
        if (!isRunning) throw RuntimeException("Stopwatch wasn\'t called with Stopwatch.start()")

        endTime = Instant.now()
        isRunning = false

        return Duration.between(startTime, endTime)
    }
}
