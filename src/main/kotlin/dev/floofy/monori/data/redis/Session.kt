package dev.floofy.monori.data.redis

import dev.floofy.monori.managers.Device
import kotlinx.serialization.Serializable

/**
 * Data structure of a session that is created and deleted
 * from the [dev.floofy.monori.managers.SessionManager]
 *
 * Data is serialized to and from JSON when being interjected
 * with Redis.
 */
@Serializable
data class Session(
    val startedAt: Long,
    val device: Device,
    val userId: String,
    val id: String
)
