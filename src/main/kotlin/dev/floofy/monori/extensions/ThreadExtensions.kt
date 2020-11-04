package dev.floofy.monori.extensions

/**
 * Inline function to create a [java.lang.Thread] thread.
 * @param name The name of the thread
 * @param block The chunk of code to run when it's executed
 */
fun createThread(name: String, block: () -> Unit): Thread = (object: Thread(name) {
    override fun run() { block() }
})
