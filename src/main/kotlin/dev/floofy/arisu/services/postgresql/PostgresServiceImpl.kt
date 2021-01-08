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

package dev.floofy.arisu.services.postgresql

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import dev.floofy.arisu.data.Config
import dev.floofy.arisu.kotlin.logging
import io.ktor.util.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction

@KtorExperimentalAPI
class PostgresServiceImpl(private val config: Config): PostgresService {
    private lateinit var dataSource: HikariDataSource
    override lateinit var database: Database
    private val logger by logging(this::class.java)

    override fun connect() {
        logger.info("Now creating a connection with PostgreSQL...")
        val config = HikariConfig().apply {
            this.jdbcUrl = "jdbc:postgresql://${config.database.host}:${config.database.port}/${config.database.database}"
            this.username = config.database.username
            this.password = config.database.password
            this.schema = config.database.schema
            this.driverClassName = "org.postgresql.Driver"
        }

        dataSource = HikariDataSource(config)
        database = Database.connect(dataSource)

        logger.info("Connected to PostgreSQL Successfully! (version=${database.version})")
        transaction {
            addLogger(StdOutSqlLogger)
        }
    }

    override fun close() {
        logger.warn("Disconnecting from PostgreSQL")
        dataSource.close()
    }
}
