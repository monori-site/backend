package dev.floofy.monori.managers

import dev.floofy.monori.data.redis.Session
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

        sessions.clear()
        tasks.forEach { it.cancel() }
        tasks.clear()

        logger.info("All sessions and tasks are cleared.")
    }
}
