package dev.floofy.arisu

import io.ktor.application.*
import io.ktor.features.*

/**
 * Arisu module to install Arisu into ktor.
 */
fun Application.arisu() {
    install(ContentNegotiation) {
        
    }
}
