package dev.floofy.arisu.services.audits

import com.mongodb.client.FindIterable
import com.mongodb.client.MongoCollection
import dev.floofy.arisu.services.mongodb.MongoService
import dev.floofy.arisu.services.mongodb.documents.AuditLogDocument
import dev.floofy.arisu.services.mongodb.documents.AuditLogType
import org.litote.kmongo.*

class AuditLogService(mongo: MongoService) {
    private val collection: MongoCollection<AuditLogDocument> = mongo.collection("audits")

    fun getAuditLog(id: Id<AuditLogDocument>): AuditLogDocument?
        = collection.findOne(AuditLogDocument::id eq id)

    // TODO: find a way to check if type => project:updated
    // and use hash maps and convert them to objects?
    fun createAuditLog(owner: String, type: AuditLogType): AuditLogDocument {
        val document = AuditLogDocument(
            entityID=owner,
            type
        )

        collection.insertOne(document)
        return document
    }

    fun findAuditLogs(owner: String): FindIterable<AuditLogDocument> =
        collection.find(AuditLogDocument::entityID eq owner)
}
