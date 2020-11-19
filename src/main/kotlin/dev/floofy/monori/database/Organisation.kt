package dev.floofy.monori.database

import org.jetbrains.exposed.sql.Table

object Organisation: Table("organisations") {
    // TODO: add date serialization?
    val createdAt = varchar("created_at", 256)
}
