package dev.floofy.monori.core

import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ExecutorService

/**
 * Represents a class to perform asynchronous transactions with coroutines,
 * you might wanna use the [dev.floofy.monori.extensions.asyncTransaction] inline
 * function to create one easily.
 *
 * @param executor The executor pool to run the transaction
 * @param block The block of code to run
 */
class AsyncTransaction<T>(
    val executor: ExecutorService,
    private val block: Transaction.() -> T
) {

    /**
     * Executes the transaction
     */
    fun execute(): CompletableFuture<T> {
        val future = CompletableFuture<T>()

        executor.execute {
            try {
                future.complete(transaction { block() })
            } catch(ex: Throwable) {
                future.completeExceptionally(ex)
            }
        }

        return future
    }

}

