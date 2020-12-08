package dev.floofy.arisu.services.postgresql.entity

import dev.floofy.arisu.services.postgresql.tables.ProjectTable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID

class Project(id: EntityID<Int>): IntEntity(id) {
    companion object: IntEntityClass<Project>(ProjectTable)

    var description by ProjectTable.description
    var createdAt by ProjectTable.createdAt
    var updatedAt by ProjectTable.updatedAt
    var github by ProjectTable.github
    var owner by ProjectTable.owner
    var name by ProjectTable.name
}
