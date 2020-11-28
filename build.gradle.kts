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

import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import com.diffplug.gradle.spotless.SpotlessApply
import org.apache.tools.ant.filters.ReplaceTokens

plugins {
    id("com.github.johnrengelman.shadow") version "6.1.0"
    kotlin("plugin.serialization") version "1.4.10"
    id("com.diffplug.spotless") version "5.7.0"
    id("com.palantir.docker") version "0.25.0"
    kotlin("jvm") version "1.4.10"
    application
}

val ver = Version(1, 0, 0)

group = "dev.floofy.arisu"
version = ver.string()

repositories {
    mavenCentral()
    jcenter()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.0.1")
    implementation("org.litote.kmongo:kmongo-serialization:4.2.1")
    implementation("org.jetbrains.exposed:exposed-core:0.28.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.24.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.24.1")
    implementation("ch.qos.logback:logback-classic:1.2.3")
    implementation("org.postgresql:postgresql:42.2.18")
    implementation("org.litote.kmongo:kmongo-id:4.2.1")
    implementation("com.charleskorn.kaml:kaml:0.26.0")
    implementation("org.slf4j:slf4j-api:1.7.30")
    implementation("com.zaxxer:HikariCP:3.4.5")
    implementation("redis.clients:jedis:3.3.0")
    implementation("io.vertx:vertx-core:3.9.4")
    implementation("io.vertx:vertx-web:3.9.4")
    implementation("org.koin:koin-core:2.1.6")
    implementation("io.sentry:sentry:3.2.0")
    implementation(kotlin("stdlib"))
}

val metadata = task<Copy>("metadata") {
    from("src/main/resources") {
        include("**/metadata.properties")

        val tokens = mapOf(
            "version" to ver.string(),
            "commit" to ver.commit()
        )

        filter<ReplaceTokens>(mapOf("tokens" to tokens))
    }

    rename { "app.properties" }
    into("src/main/resources")
    includeEmptyDirs = true
}

val spotlessApply: SpotlessApply by tasks
val shadowJar: ShadowJar by tasks

spotless {
    kotlin {
        trimTrailingWhitespace()
        licenseHeaderFile("${rootProject.projectDir}/.cache/HEADER")
        endWithNewline()

        // We can't use the .editorconfig file, so we'll have to specify it here
        // issue: https://github.com/diffplug/spotless/issues/142
        ktlint()
            .userData(mapOf(
                "no-consecutive-blank-lines" to "true",
                "no-unit-return" to "true",
                "disabled_rules" to "no-wildcard-imports,colon-spacing",
                "indent_size" to "4"
            ))
    }
}

application {
    mainClassName = "dev.floofy.arisu.Bootstrap"
}

tasks {
    compileKotlin {
        kotlinOptions {
            jvmTarget = JavaVersion.VERSION_11.toString()
        }
    }

    named<ShadowJar>("shadowJar") {
        mergeServiceFiles()
        archiveClassifier.set(null as String?)
        archiveBaseName.set("Arisu")

        manifest {
            attributes(mapOf(
                "Manifest-Version" to "1.0.0",
                "Main-Class" to "dev.floofy.arisu.Bootstrap"
            ))
        }
    }

    build {
        dependsOn(spotlessApply)
        dependsOn(shadowJar)
        dependsOn(metadata)
    }
}

class Version(
    private val major: Int,
    private val minor: Int,
    private val revision: Int
) {
    fun string(): String = "$major.$minor${if (revision == 0) "" else ".$revision"}"
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
