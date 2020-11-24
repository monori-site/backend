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

package dev.floofy.arisu.services.postgresql

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import dev.floofy.arisu.data.Configuration
import dev.floofy.arisu.exposed.tables.TestTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.*

/**
 * Represents a service for creating connections to PostgreSQL, Arisu uses PostgreSQL to store data that is structured:
 *
 * - User Accounts
 * - Organisations
 * - Projects
 */
class PostgresService(private val config: Configuration) {
    private lateinit var database: Database
    private lateinit var source: HikariDataSource
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    fun connect() {
        logger.info("Now connecting to PostgreSQL...")
        source = HikariDataSource(HikariConfig().let { c ->
            c.jdbcUrl = "jdbc:postgresql://${config.database.host}:${config.database.port}/${config.database.database}"
            c.username = config.database.username
            c.password = config.database.password
            c.schema = config.database.schema ?: "public"
            c.driverClassName = "org.postgresql.Driver"

            c
        })

        val db = Database.connect(source)
        logger.info("Connected to PostgreSQL, using v${db.version}")

        transaction {
            addLogger(StdOutSqlLogger)

            // Drop it in development
            SchemaUtils.drop(TestTable)
            SchemaUtils.create(TestTable)
        }

        // hopefully this will do the trick to store
        database = db
    }
}
