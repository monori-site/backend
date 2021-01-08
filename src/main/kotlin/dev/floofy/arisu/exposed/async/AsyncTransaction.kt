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

package dev.floofy.arisu.exposed.async

import java.util.concurrent.CompletableFuture
import java.util.concurrent.ExecutorService
import kotlinx.coroutines.future.await
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.transactions.transaction

class AsyncTransaction<T>(
    private val pool: ExecutorService,
    private val block: Transaction.() -> T
) {

    /**
     * Processes the transaction
     */
    fun execute(): CompletableFuture<T> {
        val fut = CompletableFuture<T>()
        pool.execute {
            try {
                fut.complete(transaction { block() })
            } catch (ex: Exception) {
                fut.completeExceptionally(ex)
            }
        }

        return fut
    }

    /**
     * Executes and awaits the transaction
     */
    suspend fun await(): T = execute().await()
}
