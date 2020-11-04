package dev.floofy.monori.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Enum class for defining the environment of the backend service
 */
@Serializable
enum class Environment {
    @SerialName("development")
    Development,

    @SerialName("production")
    Production
}
