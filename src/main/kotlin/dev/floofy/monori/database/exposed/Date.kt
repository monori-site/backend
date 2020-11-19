package dev.floofy.monori.database.exposed

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ColumnType
import org.jetbrains.exposed.sql.Table
import java.util.*

fun Table.date(name: String, type: ColumnType): Column<Date>
    = registerColumn(name, DateColumnType(type))

class DateColumnType(private val type: ColumnType): ColumnType() {
    override fun sqlType(): String = buildString {
        append(type.sqlType())
        append(" DATE")
    }
}
