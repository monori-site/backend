package dev.floofy.monori.database.exposed

import org.jetbrains.exposed.sql.*
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.*

private fun convertInstantToString(value: Instant): String {
    val formatter = DateTimeFormatter
        .ofLocalizedDateTime(FormatStyle.SHORT)
        .withLocale(Locale.ROOT)

    return formatter.format(value)
}

/**
 * Registers a column as a [java.time.Instant] value
 */
fun Table.date(name: String): Column<Instant>
    = registerColumn(name, DateColumnType())

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
