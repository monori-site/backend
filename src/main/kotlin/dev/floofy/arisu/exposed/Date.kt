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

package dev.floofy.arisu.exposed

import java.time.Instant
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.*
import org.jetbrains.exposed.sql.*

private fun convertInstantToString(value: Instant): String {
    val formatter = DateTimeFormatter
        .ofLocalizedDateTime(FormatStyle.SHORT)
        .withLocale(Locale.ROOT)

    return formatter.format(value)
}

/**
 * Registers a column as a [java.time.Instant] value
 */
fun Table.date(name: String): Column<Instant> =
        registerColumn(name, DateColumnType())

class DateColumnType: ColumnType() {
    override fun sqlType(): String = "DATE"

    override fun valueToDB(value: Any?): Any? {
        if (value is String) return value
        if (value is Instant) return convertInstantToString(value)

        return super.valueToDB(value)
    }

    override fun nonNullValueToString(value: Any): String {
        if (value is String) return value
        if (value is Instant) return convertInstantToString(value)

        return super.nonNullValueToString(value)
    }
}
