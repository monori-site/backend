package dev.floofy.arisu.services.postgresql.tables

import dev.floofy.arisu.exposed.columns.array
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.TextColumnType

object UserTable: IntIdTable("users") {
    val createdAt = text("created_at")
    val username = varchar("username", 256)
    val password = text("password")
    val projects = array<String>("projects", TextColumnType())
    val email = text("email")
    val admin = bool("admin")
    val flags = integer("flags") // bitfield flags
    val name = text("name").nullable()
}
