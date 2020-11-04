package dev.floofy.monori.data

/**
 * Represents a data structure class of the <code>app.properties</code>
 * file when using <code>gradlew build</code>
 */
data class Application(
    /**
     * The version of the backend service
     */
    val version: String,

    /**
     * The commit hash from Git
     */
    val commit: String
)
