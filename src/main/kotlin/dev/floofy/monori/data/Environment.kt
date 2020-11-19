package dev.floofy.monori.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class Environment {
    // Service is running under development
    @SerialName("development")
    Development,

    // Service is running under production
    @SerialName("production")
    Production
}
