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

const Permissions = require('../util/Permissions');
const { Router } = require('../structures');
const router = new Router('/organisations');

router.get({
  parameters: [
    ['id', true]
  ],
  path: '/:id',
  async run(req, res) {
    const org = await this.database.getOrganisation(req.params.id);
    if (org === null) return res.status(404).send({
      statusCode: 404,
      message: `Organisation with ID "${req.params.id}" was not found`
    });

    return res.status(200).send({
      statusCode: 200,
      data: {
        permissions: org.permissions,
        createdAt: org.createdAt,
        projects: org.projects,
        members: org.members,
        github: org.github,
        avatar: org.avatar,
        owner: org.owner,
        name: org.name,
        id: org.id
      }
    });
  }
});

router.get({
  parameters: [
    ['id', true]
  ],
  path: '/:id/projects',
  async run(req, res) {
    const projects = await this.database.getOrganisationProjects(req.params.id);
    if (projects === null || !projects.length) return res.status(404).send({
      statusCode: 404,
      message: `Organisation with ID "${req.params.id}" was not found or no projects were inserted`
    });

    return res.status(200).send({
      statusCode: 200,
      data: projects.map(project => ({
        translations: project.translations,
        description: project.description,
        completed: project.completed,
        github: project.github,
        avatar: project.avatar,
        owner: project.owner,
        name: project.name,
        id: project.id
      }))
    });
  }
});

router.put({
  authenicate: true,
  body: [
    ['name', true]
  ],
  path: '/',
  async run(req, res) {
    const session = await this.sessions.get(req.connection.remoteAddress);
    const id = await this.database.createOrganisation(req.body.name, session.userID);

    return res.statusCode(201).send({
      statusCode: 201,
      data: id
    });
  }
});

router.patch({
  authenicate: true,
  body: [
    ['data', true]
  ],
  path: '/',
  async run(req, res) {
    const successful = await this.database.updateOrganisation(req.body.data);
    return res.status(200).send({
      statusCode: 200,
      data: { successful }
    });
  }
});

router.delete({
  authenicate: true,
  parameters: [
    ['id', true]
  ],
  path: '/',
  async run(req, res) {
    await this.database.deleteOrganisation(req.params.id);
    return res.status(204).send();
  }
});

router.patch({
  authenicate: true,
  body: [
    ['memberID', true],
    ['orgID', true]
  ],
  path: '/members/remove',
  async run(req, res) {
    const org = await this.database.getOrganisation(req.body.orgID);
    if (org === null) return res.status(404).send({
      statusCode: 404,
      message: `Organisation with ID "${req.body.orgID}" doesn't exist`
    });

    if (!org.members.includes(req.body.memberID)) return res.status(403).send({
      statusCode: 403,
      message: 'Cannot remove member since they aren\'t apart of the organisation'
    });

    await this.database.deleteMemberFromOrg(req.body.orgID, req.body.memberID);
    return res.status(204).send();
  }
});

router.patch({
  authenicate: true,
  body: [
    ['memberID', true],
    ['orgID', true]
  ],
  path: '/members/add',
  async run(req, res) {
    const org = await this.database.getOrganisation(req.body.orgID);
    if (org === null) return res.status(404).send({
      statusCode: 404,
      message: `Organisation with ID "${req.body.orgID}" doesn't exist`
    });

    if (org.members.includes(req.body.memberID)) return res.status(403).send({
      statusCode: 403,
      message: 'Cannot ad member since they are apart of the organisation'
    });

    await this.database.addMemberToOrg(req.body.orgID, req.body.memberID);
    return res.status(204).send();
  }
});

router.patch({
  authenicate: true,
  body: [
    ['memberID', true],
    ['permission', true],
    ['orgID', true]
  ],
  patch: '/members/add/permission',
  async run(req, res) {
    const org = await this.database.getOrganisation(req.body.orgID);
    if (org === null) return res.status(404).send({
      statusCode: 404,
      message: `Organisation with ID "${req.body.orgID}" doesn't exist`
    });

    if (org.members.includes(req.body.memberID)) return res.status(403).send({
      statusCode: 403,
      message: 'Cannot ad member since they are apart of the organisation'
    });

    const raw = org.permissions[req.body.memberID];
    const permissions = new Permissions(raw.allowed, raw.denied);

    if (permissions.overlaps(req.body.permission)) return res.status(406).send({
      statusCode: 406,
      message: `User already overlaps permission "${req.body.permission}"`
    });

    // this is gonna be an overhaul of how to do it but eh
    const bytecode = permissions.allowed + req.body.permission;

    await this.database.updateOrganisation({
      permission: {
        range: {
          allowed: bytecode,
          denied: permissions.denied
        },
        memberID: req.body.memberID
      }
    });

    return res.status(204).send();
  }
});

router.patch({
  authenicate: true,
  body: [
    ['memberID', true],
    ['permission', true],
    ['orgID', true]
  ],
  patch: '/members/remove/permission',
  async run(req, res) {
    const org = await this.database.getOrganisation(req.body.orgID);
    if (org === null) return res.status(404).send({
      statusCode: 404,
      message: `Organisation with ID "${req.body.orgID}" doesn't exist`
    });

    if (org.members.includes(req.body.memberID)) return res.status(403).send({
      statusCode: 403,
      message: 'Cannot ad member since they are apart of the organisation'
    });

    const raw = org.permissions[req.body.memberID];
    const permissions = new Permissions(raw.allowed, raw.denied);

    if (!permissions.overlaps(req.body.permission)) return res.status(406).send({
      statusCode: 406,
      message: `User doesn't overlap permission "${req.body.permission}"`
    });

    // this is gonna be an overhaul of how to do it but eh
    const bytecode = permissions.allowed - req.body.permission;

    await this.database.updateOrganisation({
      permission: {
        range: {
          allowed: bytecode,
          denied: permissions.denied + req.body.permission
        },
        memberID: req.body.memberID
      }
    });

    return res.status(204).send();
  }
});

module.exports = router;