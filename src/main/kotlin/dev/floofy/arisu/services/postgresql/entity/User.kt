package dev.floofy.arisu.services.postgresql.entity

import dev.floofy.arisu.services.postgresql.tables.UserTable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID

class User(id: EntityID<Int>): IntEntity(id) {
    companion object: IntEntityClass<User>(UserTable)

    var organisations by UserTable.organisations
    var createdAt by UserTable.createdAt
    var username by UserTable.username
    var password by UserTable.password
    var projects by UserTable.projects
    var email by UserTable.email
    var admin by UserTable.admin
    var flags by UserTable.flags
    var name by UserTable.name
}
