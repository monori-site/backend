package dev.floofy.monori_old.util

import io.vertx.core.http.HttpServerRequest

/**
 * Utility class to handling user IPs, we use this
 * for sessions and we do not send telemetry information
 * with user IPs, mainly for session validation and nothing else.
 */
object IPUtil {
    private val IPV6_REGEX: Regex = "/^((?=.*::)(?!.*::.+::)(::)?([\\dA-F]{1,4}:(:|\\b)|){5}|([\\dA-F]{1,4}:){6})((([\\dA-F]{1,4}((?!\\3)::|:\\b|\$))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})\$/i".toRegex()
    private val IPV4_REGEX: Regex = "/^(?:(?:\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\$/".toRegex()

    /**
     * Simpler way to check if <code>value</code> is a IPv4 or a IPv6 address
     */
    fun isIP(value: String): Boolean = this.isIPv4(value) || this.isIPv6(value)

    /**
     * Checks if <code>value</code> is a IPv4 address
     * @param value The value to check
     */
    private fun isIPv4(value: String): Boolean = value.matches(IPV4_REGEX)

    /**
     * Checks if <code>value</code> is a IPv6 address
     * @param value The value to check
     */
    private fun isIPv6(value: String): Boolean = value.matches(IPV6_REGEX)

    /**
     * Gets a client's IP from the X-Forwareded-For header
     * @param value The value to check
     */
    fun getClientIpFromForwarded(value: String): String? {
        val ips: List<String> = value.split(",").map {
            val ip = it.trim()
            if (ip.contains(":")) {
                val contents = ip.split(":")
                if (contents.size == 2) return contents[0]
            }

            return ip
        }

        return ips.find { isIP(it) }
    }

    /**
     * Gets the IP of the request
     * @param req The request
     */
    fun getIp(req: HttpServerRequest): String? {
        val headers = req.headers()

        if (isIP(headers["x-client-ip"])) return headers["x-client-ip"]
        if (isIP(headers["cf-connecting-ip"])) return headers["cf-connecting-ip"]
        if (isIP(headers["fastly-client-ip"])) return headers["fastly-client-ip"]
        if (isIP(headers["true-client-ip"])) return headers["true-client-ip"]
        if (isIP(headers["x-real-ip"])) return headers["x-real-ip"]
        if (isIP(headers["x-forwarded"])) return headers["x-forwarded"]
        if (isIP(headers["forwarded-for"])) return headers["forwarded-for"]
        if (isIP(headers["forwarded"])) return headers["forwarded"]
        if (isIP(headers["x-cluster-client-ip"])) return headers["x-cluster-client-ip"]

        val xForwarded = getClientIpFromForwarded(headers["x-forwarded-for"]) ?: ""
        if (isIP(xForwarded)) return xForwarded

        val connection = req.connection()
        if (isIP(connection.remoteAddress().toString())) return connection.remoteAddress().toString()

        return null
    }
}