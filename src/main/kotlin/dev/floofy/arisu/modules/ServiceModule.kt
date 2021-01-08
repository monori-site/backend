/**
 * Copyright (c) 2020-2021 Arisu
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

package dev.floofy.arisu.modules

import dev.floofy.arisu.services.postgresql.PostgresService
import dev.floofy.arisu.services.postgresql.PostgresServiceImpl
import dev.floofy.arisu.services.redis.RedisService
import dev.floofy.arisu.services.redis.RedisServiceImpl
import dev.floofy.arisu.services.sentry.SentryService
import dev.floofy.arisu.services.sentry.SentryServiceImpl
import dev.floofy.arisu.services.snowflake.SnowflakeService
import dev.floofy.arisu.services.snowflake.SnowflakeServiceImpl
import io.ktor.util.*
import org.koin.dsl.module

@KtorExperimentalAPI
val serviceModule = module {
    single<SnowflakeService> { SnowflakeServiceImpl() }
    single<PostgresService> { PostgresServiceImpl(get()) }
    single<SentryService> { SentryServiceImpl(get()) }
    single<RedisService> { RedisServiceImpl(get()) }
}
