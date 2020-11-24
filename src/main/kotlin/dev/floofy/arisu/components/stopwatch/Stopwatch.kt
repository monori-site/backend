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

package dev.floofy.arisu.components.stopwatch

import java.lang.IllegalStateException

class Stopwatch(val prefix: String) {

    /**
     * The current state of this [Stopwatch]
     */
    private enum class State {
        RUNNING {
            val isRunning: Boolean
                get() = true

            val started: Boolean
                get() = true

            val stopped: Boolean
                get() = false
        },

        UNINTIAILIZED {
            val isRunning: Boolean
                get() = false

            val started: Boolean
                get() = false

            val stopped: Boolean
                get() = false
        },

        DISPOSED {
            val isRunning: Boolean
                get() = false

            val started: Boolean
                get() = false

            val stopped: Boolean
                get() = true
        };

        override fun toString(): String = when (this) {
            UNINTIAILIZED -> "Uninitialized"
            DISPOSED -> "Disposed"
            RUNNING -> "Running"
        }
    }

    companion object {
        fun create(prefix: String) = Stopwatch(prefix)
    }

    /**
     * The current state of this [Stopwatch]
     */
    private var state: State = State.UNINTIAILIZED

    /**
     * Start time
     */
    private var startTime: Long = 0L

    /**
     * End time
     */
    private var endTime: Long = 0L

    /**
     * Calculates the time without interfering the current state
     */
    private val nanoTime: Long
        get() = when (this.state) {
            State.UNINTIAILIZED -> 0L
            State.DISPOSED -> (this.endTime - this.startTime)
            State.RUNNING -> (System.nanoTime() - this.startTime)
        }

    /**
     * Starts the stopwatch
     */
    fun start(): Stopwatch {
        if (this.state == State.DISPOSED) throw IllegalStateException("state = disposed, can't do anything")

        startTime = System.nanoTime()
        state = State.RUNNING

        return this
    }

    /**
     * Ends the stopwatch
     */
    fun end(): Stopwatch {
        if (this.state != State.RUNNING) throw IllegalStateException("state != running, can't calculate")

        endTime = System.nanoTime()
        state = State.DISPOSED

        return this
    }

    /**
     * Converts the [nanoTime] into milliseconds
     */
    fun toMilli(): Long = this.nanoTime / 1000000L

    override fun toString(): String = "[($prefix) d.f.arisu.components.Stopwatch<$state>]"
}
