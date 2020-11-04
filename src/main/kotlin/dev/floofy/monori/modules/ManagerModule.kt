package dev.floofy.monori.modules

import dev.floofy.monori.managers.SentryManager
import org.koin.dsl.module

val managerModule = module {
    single { // Sentry Manager
        SentryManager(get(), get())
    }
}
