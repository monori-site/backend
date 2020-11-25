package dev.floofy.arisu.services.postgresql.tables

import dev.floofy.arisu.exposed.columns.array
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.TextColumnType

object WebhookTable: IntIdTable("webhooks") {
    val contentType = text("content_type")
    val createdAt = text("created_at")
    val ownerID = integer("owner_id")
    val secret = text("secret").nullable()
    val events = array<String>("events", TextColumnType())
    val ssl = bool("ssl")
    val url = text("url")
}
