package dev.floofy.arisu.services.hashing

import de.mkammerer.argon2.Argon2

/**
 * Utility service to hash all user passwords, hence "Hashing Service"
 */
class HashingService(private val argon: Argon2) {
    fun encode(password: String) {

    }

}