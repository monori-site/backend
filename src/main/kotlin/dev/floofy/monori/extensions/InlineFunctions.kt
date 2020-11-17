package dev.floofy.monori.extensions

import dev.floofy.monori.core.AsyncTransaction
import org.jetbrains.exposed.sql.Transaction
import java.io.InputStream
import java.util.*
import java.util.concurrent.ExecutorService

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
 * Inline function to use a [java.io.InputStream] to create a new [java.util.Properties] class
 * @param stream The input stream
 */
fun loadProperties(stream: InputStream) = Properties().apply { load(stream) }
