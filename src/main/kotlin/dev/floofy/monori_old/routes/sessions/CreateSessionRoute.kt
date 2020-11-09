package dev.floofy.monori_old.routes.sessions

import dev.floofy.monori_old.util.IPUtil
import dev.floofy.monori_old.core.Constants
import dev.floofy.monori_old.extensions.*
import dev.floofy.monori_old.managers.Device
import dev.floofy.monori_old.managers.SessionManager
import dev.floofy.monori_old.routing.Route
import io.vertx.core.http.HttpMethod
import io.vertx.core.json.JsonObject
import io.vertx.ext.web.RoutingContext

class CreateSessionRoute(private val sessions: SessionManager): Route(HttpMethod.PUT, "/sessions") {
    override fun run(ctx: RoutingContext) {
        val req = ctx.request()
        val res = ctx.response()

        val device = req.getHeader("x-monori-device")
            ?: return res.setStatusCode(406).end(JsonObject().apply {
                put("message", "No device was added (missing X-Monori-Device header)")
            })

        // Still can't get over this but it'll have to be
        // through the frontend with this?
        if (!Constants.DEVICES.contains(device)) return res.setStatusCode(406).end(JsonObject().apply {
            put("message", "Invalid device `$device`.")
        })

        val ip = IPUtil.getIp(req) ?: "local"
        val actualDevice = when (device) {
            "iOS", "Android", "Blackberry", "Windows Mobile" -> Device.Mobile
            else -> Device.Desktop
        }

        sessions.create("auguwu", actualDevice, ip)
        return res.setStatusCode(201).end(JsonObject().apply {
            put("device", device)
            put("user_id", "auguwu")
        })
    }
}
