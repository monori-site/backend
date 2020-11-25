package dev.floofy.arisu.services.postgresql.tables

import dev.floofy.arisu.exposed.columns.array
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.TextColumnType

object OrganisationTable: IntIdTable("organisations") {
    val description = varchar("description", 2000)
    val createdAt = text("created_at")
    val updatedAt = text("updated_at")
    val projects = array<String>("projects", TextColumnType())
    val members = array<String>("members", TextColumnType())
    val twitter = text("twitter")
    val website = text("website")
    val github = text("github")
    val name = varchar("name", 256)
}
