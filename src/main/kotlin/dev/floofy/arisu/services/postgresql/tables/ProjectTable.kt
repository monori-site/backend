package dev.floofy.arisu.services.postgresql.tables

import org.jetbrains.exposed.dao.id.IntIdTable

object ProjectTable: IntIdTable("projects") {
    val description = varchar("description", 256)
    val createdAt = text("created_at")
    val updatedAt = text("updated_at")
    val name = varchar("name", 256)
}
