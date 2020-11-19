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

package dev.floofy.monori.database

import java.util.concurrent.CompletableFuture
import java.util.concurrent.ExecutorService
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.transactions.transaction

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
            } catch (ex: Throwable) {
                future.completeExceptionally(ex)
            }
        }

        return future
    }
}
