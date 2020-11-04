package dev.floofy.monori.data

import kotlinx.serialization.Serializable

@Serializable
data class DatabaseConfig(
    val username: String,
    val password: String,
    val database: String = "i18n",
    val host: String,
    val port: Int
)
