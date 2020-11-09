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
package dev.floofy.monori_old.managers

import dev.floofy.monori_old.data.redis.Session
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import redis.clients.jedis.Jedis
import org.slf4j.*
import java.util.*
import kotlin.concurrent.schedule

/**
 * Represents a device that the user is running on
 */
@Serializable
enum class Device {
    @SerialName("unknown")
    Unknown,

    @SerialName("desktop")
    Desktop,

    @SerialName("mobile")
    Mobile,

    @SerialName("tablet")
    Tablet
}

/**
 * Represents a manager for handling concurrent sessions
 * available through-out the service, we use Redis so
 * this is based on O(N) time complexity; where the larger
 * increase of requests -- the longer it'll have to
 * implement.
 *
 * We also use hashing to store the data and using [kotlinx.serialization]
 * to serialize it to a [Session] data object.
 *
 * All sessions are available for a week (or set by the configuration file)
 * until it's deleted and the session is removed from the Frontend.
 *
 * You can view a list of sessions available using the
 * <code>GET /users/:id/sessions</code> endpoint to view
 * the available sessions to the user.
 *
 * @param redis The Redis instance running that is injected
 */
class SessionManager(private val redis: Jedis) {
    /**
     * List of sessions available during this service's lifetime.
     */
    private val sessions: MutableMap<String, Session> = mutableMapOf()

    /**
     * The logger available for this [SessionManager]
     */
    private val logger: Logger = LoggerFactory.getLogger(this::class.java)

    /**
     * List of tasks available to kill off when we call off the service
     */
    private val tasks: MutableList<TimerTask> = mutableListOf()

    /**
     * Gets a session from it's ID
     * @param id The session ID
     * @returns A session object or <code>null</code> if not found
     */
    fun get(id: String): Session? {
        // It's not connected, let's just throw `null`
        if (!redis.isConnected) return null

        val sess = redis.hget("sessions", "session:$id") ?: return null
        return Json.decodeFromString(Session.serializer(), sess)
    }

    /**
     * Creates a session
     * @param userID The user's ID that is correlated
     * @param device The user's device they are using
     * @param ip The user's IP address, this is set to <code>local</code>
     * if running on localhost for testing environments
     */
    fun create(
        userID: String,
        device: Device,
        ip: String?
    ) {
        // Let's not do anything if Redis isn't connected
        if (!redis.isConnected) return

        val block = Session(
            startedAt=System.currentTimeMillis(),
            device=device,
            userId=userID,
            id="session:${ip ?: "local"}"
        )

        val task = Timer().schedule(604800000L) {
            val session = redis.hget("sessions", ip ?: "local")
            val obj = Json.decodeFromString(Session.serializer(), session)

            if (session != null) {
                logger.info("Found session ${obj.id} (user: ${obj.userId}, device: ${obj.device}), now killing...")

                val result = redis.hdel("sessions", ip ?: "local")

                if (result == 1L) logger.info("Successfully deleted session ${obj.id}!")
                else logger.warn("Unable to delete session ${obj.id} from Redis, was it found?")
            }
        }

        redis.hset("sessions", ip ?: "local", Json.encodeToString(block))
        logger.info("Session created: ${block.id}")

        sessions[block.id] = block
        tasks.add(task)

        task.run()
    }

    /**
     * Destroys this [SessionManager]
     */
    fun destroy() {
        logger.warn("Called to clear all sessions and tasks...")

        val allSessions = sessions.size
        val allTasks = tasks.size

        sessions.clear()
        tasks.forEach { it.cancel() }
        tasks.clear()

        logger.info("Cleared $allSessions sessions and $allTasks tasks")
    }
}
