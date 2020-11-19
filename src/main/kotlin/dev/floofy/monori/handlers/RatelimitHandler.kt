package dev.floofy.monori.handlers

import dev.floofy.monori.data.misc.RatelimitInfo
import java.util.concurrent.ConcurrentHashMap

/**
 * Class to handle ratelimit throttles, cached using concurrent hash maps.
 */
class RatelimitHandler {
    private val ratelimits: ConcurrentHashMap<String, RatelimitInfo> = ConcurrentHashMap()
}
