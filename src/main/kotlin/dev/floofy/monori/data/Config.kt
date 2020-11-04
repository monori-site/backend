package dev.floofy.monori.data

import kotlinx.serialization.Serializable

@Serializable
data class Config(
    val environment: Environment = Environment.development,
    val sentryDSN: String? = null,
    val database: DatabaseConfig,
    val workers: Int = 40,
    val mongo: MongoConfig,
    val redis: RedisConfig,
    val port: Int
)
