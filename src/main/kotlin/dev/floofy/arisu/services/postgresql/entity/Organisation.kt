package dev.floofy.arisu.services.postgresql.entity

import dev.floofy.arisu.services.postgresql.tables.OrganisationTable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID

class Organisation(id: EntityID<Int>): IntEntity(id) {
    companion object: IntEntityClass<Organisation>(OrganisationTable)

    var description by OrganisationTable.description
    var createdAt by OrganisationTable.createdAt
    var updatedAt by OrganisationTable.updatedAt
    var projects by OrganisationTable.projects
    var members by OrganisationTable.members
    var twitter by OrganisationTable.twitter
    var website by OrganisationTable.website
    var github by OrganisationTable.github
    var name by OrganisationTable.name
}
