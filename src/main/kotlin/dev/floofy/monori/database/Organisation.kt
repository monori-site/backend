package dev.floofy.monori.database

import dev.floofy.monori.database.exposed.*
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.TextColumnType

// TODO: switch to exposed dao
object Organisation: Table("organisations") {
    val createdAt = date("created_at")
    val projects = array<String>("projects", TextColumnType())
    val members = array<String>("members", TextColumnType())
    val name = text("name")
    val id = long("id")
}
