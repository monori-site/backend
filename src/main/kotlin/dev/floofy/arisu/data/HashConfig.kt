package dev.floofy.arisu.data

import kotlinx.serialization.Serializable

@Serializable
data class HashConfig(
    val parallelism: Int = 1,
    val iterations: Int = 1000,
    val maxMemory: Int = 65536
)
