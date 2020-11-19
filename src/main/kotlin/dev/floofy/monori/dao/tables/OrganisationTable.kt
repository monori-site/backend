package dev.floofy.monori.dao.tables

import org.jetbrains.exposed.dao.id.IntIdTable

object OrganisationTable: IntIdTable() {
    val createdAt = varchar("created_at", 50)
}
