package dev.floofy.arisu.services.mongodb.documents

import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.litote.kmongo.Id
import org.litote.kmongo.newId

@Serializable
data class AuditLogDocument(
    val entityID: String,
    val type: AuditLogType,

    @Contextual
    @SerialName("_id")
    val id: Id<AuditLogDocument> = newId()
) {

    fun getTypeAlias(): String = when (type) {
        AuditLogType.ProjectOwnerChanged -> "project:owner:changed"
        AuditLogType.ProjectUpdated -> "project:updated"
        AuditLogType.ProjectDeleted -> "project:deleted"
        AuditLogType.ProjectCreated -> "project:created"
    }
}

@Serializable
enum class AuditLogType {
    @SerialName("project:owner:changed")
    ProjectOwnerChanged,

    @SerialName("project:created")
    ProjectCreated,

    @SerialName("project:deleted")
    ProjectDeleted,

    @SerialName("project:updated")
    ProjectUpdated
}
