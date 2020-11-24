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

package dev.floofy.arisu.services.mongodb

import com.mongodb.client.MongoClient
import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import dev.floofy.arisu.data.Configuration
import dev.floofy.arisu.services.mongodb.documents.TestDocument
import org.litote.kmongo.KMongo
import org.litote.kmongo.getCollection
import org.slf4j.Logger
import org.slf4j.LoggerFactory

/**
 * Service for MongoDB, for handling unstructured data such as:
 *
 * - User or Organisation audit logs
 * - Session storage (for retrieving later)
 */
class MongoService(private val config: Configuration) {
    private lateinit var database: MongoDatabase
    private lateinit var client: MongoClient
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    fun init() {
        logger.info("Now connecting to MongoDB...")

        val authCreds = if (config.mongodb.auth != null) {
            "${config.mongodb.auth.username}:${config.mongodb.auth.password}@"
        } else {
            ""
        }

        val sourceDb = config.mongodb.auth?.source ?: ""
        val connectionString = "mongodb://${authCreds}${config.mongodb.host}:${config.mongodb.port}/$sourceDb"
        val cli = KMongo.createClient(connectionString)

        logger.info("Initialised a new connection to MongoDB with the following connection string:")
        logger.debug(connectionString)
        cli.startSession()

        client = cli
        database = cli.getDatabase(config.mongodb.database)
    }

    fun disconnect() {
        logger.warn("Disconnecting from MongoDB...")
        client.close()
    }

    fun test(): MongoCollection<TestDocument> = database.getCollection<TestDocument>("test")
}
