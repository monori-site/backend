package dev.floofy.monori.extensions

import java.util.Properties
import java.io.InputStream

/**
 * Inline function to load a properties file using an [InputStream]
 * @param stream The stream to use
 */
fun loadProperties(stream: InputStream): Properties = Properties().apply { load(stream) }
