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

package dev.floofy.monori.extensions

import dev.floofy.monori.core.AsyncTransaction
import java.io.InputStream
import java.util.*
import java.util.concurrent.ExecutorService
import org.jetbrains.exposed.sql.Transaction

/**
 * Inline function to easily create a new [AsyncTransaction].
 * @param pool The executor pool to use
 * @param block The transaction body to run
 */
fun <T> asyncTransaction(pool: ExecutorService, block: Transaction.() -> T) = AsyncTransaction(pool, block)

/**
 * Inline function to create a new [java.lang.Thread] instance
 * @param name The name of the thread
 * @param block The body to run
 */
fun createThread(name: String, block: () -> Unit): Thread = Thread(block, name)

/**
 * Inline function to create a daemonized [java.lang.Thread] instance
 * @param name The name of the thread
 * @param block The body to run when called
 */
fun createDaemonThread(name: String, block: Runnable): Thread = Thread(block, name).apply { isDaemon = true }

/**
 * Inline function to use a [java.io.InputStream] to create a new [java.util.Properties] class
 * @param stream The input stream
 */
fun loadProperties(stream: InputStream) = Properties().apply { load(stream) }
