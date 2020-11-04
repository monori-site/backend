package dev.floofy.monori.data

import kotlinx.serialization.Serializable

@Serializable
data class MongoConfig(
    val database: String = "i18n",
    val auth: MongoAuthSource? = null,
    val host: String,
    val port: Int
)

@Serializable
data class MongoAuthSource(
    val password: String,
    val username: String,
    val dbSource: String = "admin"
)
