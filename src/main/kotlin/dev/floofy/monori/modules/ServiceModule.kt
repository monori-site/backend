package dev.floofy.monori.modules

import dev.floofy.monori.data.Config
import io.vertx.core.Vertx
import io.vertx.core.VertxOptions
import org.koin.dsl.module

val serviceModule = module {
    single {
        val config: Config = get()
        val opts = VertxOptions()
            .setWorkerPoolSize(config.workers)

        Vertx.vertx(opts)
    }
}
