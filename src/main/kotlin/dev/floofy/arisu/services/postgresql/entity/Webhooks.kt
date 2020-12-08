package dev.floofy.arisu.services.postgresql.entity

import dev.floofy.arisu.services.postgresql.tables.WebhookTable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID

class Webhooks(id: EntityID<Int>): IntEntity(id) {
    companion object: IntEntityClass<Webhooks>(WebhookTable)

    var contentType by WebhookTable.contentType
    var createdAt by WebhookTable.createdAt
    var updatedAt by WebhookTable.updatedAt
    var secret by WebhookTable.secret
    var events by WebhookTable.events
    var owner by WebhookTable.owner
    var url by WebhookTable.url
}
