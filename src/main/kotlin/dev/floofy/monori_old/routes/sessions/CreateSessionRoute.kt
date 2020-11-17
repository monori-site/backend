/**
 * Copyright (c) 2020 August
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package dev.floofy.monori_old.routes.sessions

import dev.floofy.monori_old.core.Constants
import dev.floofy.monori_old.extensions.*
import dev.floofy.monori_old.managers.Device
import dev.floofy.monori_old.managers.SessionManager
import dev.floofy.monori_old.routing.Route
import dev.floofy.monori_old.util.IPUtil
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
