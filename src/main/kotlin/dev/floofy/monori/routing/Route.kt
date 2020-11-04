package dev.floofy.monori.routing

/**
 * Represents an annotation that marks a function as this [dev.floofy.monori.routing.Route]
 */
annotation class Route(
    /**
     * The method to use when initializing this [Route]
     */
    val method: String,

    /**
     * The actual path to use, it'll inherit from the [Router]'s prefix.
     */
    val path: String
)
