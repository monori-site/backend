package dev.floofy.monori.modules

import com.charleskorn.kaml.Yaml
import dev.floofy.monori.data.Application
import dev.floofy.monori.data.Config
import dev.floofy.monori.extensions.loadProperties
import org.koin.dsl.module

import java.io.File

val configModule = module {
    single {
        val file = File("config.yml")
        Yaml.default.decodeFromString(Config.serializer(), file.readText())
    }

    single {
        val stream = this::class.java.getResourceAsStream("/app.properties")
        val props = loadProperties(stream)

        Application(
            props.getProperty("app.version", "0.0.0"),
            props.getProperty("app.commit", "unknown")
        )
    }
}
