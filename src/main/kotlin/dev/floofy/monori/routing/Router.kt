package dev.floofy.monori.routing

/**
 * Instance of a [dev.floofy.monori.routing.Router] inherited router, which
 * can initialize routes by using a function with the [dev.floofy.monori.routing.Route] annotation.
 */
class Router(val prefix: String) {
    val routes: List<Route> = listOf()
}
