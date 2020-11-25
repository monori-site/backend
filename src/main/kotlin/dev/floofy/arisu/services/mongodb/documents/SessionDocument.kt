package dev.floofy.arisu.services.mongodb.documents

import kotlinx.serialization.Contextual
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.litote.kmongo.Id
import org.litote.kmongo.newId

@Serializable
data class SessionDocument(
    val startedAt: String,
    val userId: String,

    @Contextual
    @SerialName("_id")
    val id: Id<SessionDocument> = newId()
)
