plugins {
    id("com.github.johnrengelman.shadow") version "6.1.0"
    kotlin("plugin.serialization") version "1.4.10"
    id("com.diffplug.spotless") version "5.7.0"
    id("com.palantir.docker") version "0.25.0"
    kotlin("jvm") version "1.4.10"
    application
}

val ver = Version(1, 0, 0)

group = "dev.floofy"
version = ver.string()

repositories {
    mavenCentral()
    jcenter()
}

kotlin {
    sourceSets {
        val main by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.0.1")
                implementation("com.charleskorn.kaml:kaml:0.25.0")
                implementation(kotlin("stdlib"))
            }
        }
    }
}

tasks {
    compileKotlin {
        kotlinOptions {
            jvmTarget = JavaVersion.VERSION_11.toString()
        }
    }
}

class Version(
    private val major: Int,
    private val minor: Int,
    private val revision: Int
) {
    fun string(): String = "$major.$minor.$revision"
    fun commit(): String = exec("git rev-parse HEAD")
}

/**
 * Executes a command from the build script to return an output
 * @param command The command to execute
 * @return The raw value of the command's output
 */
fun exec(command: String): String {
    val parts = command.split("\\s".toRegex())
    val process = ProcessBuilder(*parts.toTypedArray())
        .directory(file("./"))
        .redirectOutput(ProcessBuilder.Redirect.PIPE)
        .redirectError(ProcessBuilder.Redirect.PIPE)
        .start()

    process.waitFor(1, TimeUnit.MINUTES)
    return process
        .inputStream
        .bufferedReader()
        .readText()
        .trim()
}
