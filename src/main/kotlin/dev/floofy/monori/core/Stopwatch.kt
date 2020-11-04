package dev.floofy.monori.core

import java.lang.RuntimeException
import java.time.Duration
import java.time.Instant

class Stopwatch {
    private lateinit var startTime: Instant
    private lateinit var endTime: Instant
    var isRunning: Boolean = false

    fun start() {
        if (isRunning) throw RuntimeException("Stopwatch is already running")

        isRunning = true
        startTime = Instant.now()
    }

    fun stop(): Duration {
        if (!isRunning) throw RuntimeException("Stopwatch wasn\'t called with Stopwatch.start()")

        endTime = Instant.now()
        isRunning = false

        return Duration.between(startTime, endTime)
    }
}
