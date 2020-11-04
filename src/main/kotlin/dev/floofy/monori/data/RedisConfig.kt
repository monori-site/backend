package dev.floofy.monori.data

import kotlinx.serialization.Serializable

@Serializable
data class RedisConfig(
    val password: String? = null,
    val host: String,
    val port: Int,
    val db: Int = 7
)
