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

const { Router } = require('../structures');
const { decode } = require('../structures/hash');
const router = new Router('/users');

router.get({
  path: '/',
  async run(_, res) {
    return res.status(406).send({
      statusCode: 406,
      message: 'Missing "id" parameter'
    });
  }
});

router.get({
  parameters: [
    ['id', true]
  ],
  path: '/:id',
  async run(req, res) {
    const user = await this.database.getUser('id', req.params.id);
    if (user === null) return res.status(404).send({
      statusCode: 404,
      message: `User with ID "${req.params.id}" doesn't exist`
    });

    const organisations = await Promise.all(user.organisations.map(org => 
      this.database.getOrganisation(org)  
    ));

    const projects = await Promise.all(user.projects.map(project =>
      this.database.getProject(project)  
    ));

    return res.status(200).send({
      statusCode: 200,
      data: {
        organisations: organisations.map(org => ({
          permissions: org.permissions,
          createdAt: org.createdAt,
          projects: org.projects,
          members: org.members,
          github: org.github,
          avatar: org.avatar,
          name: org.name,
          id: org.id
        })),
        contributor: user.contributor,
        description: user.description,
        translator: user.translator,
        projects: projects.map(project => ({
          translations: project.translations,
          description: project.description,
          completed: project.completed,
          github: project.github,
          avatar: project.avatar,
          owner: project.owner,
          name: project.name,
          id: project.id
        })),
        username: user.username,
        avatar: user.avatar,
        admin: user.admin,
        id: user.id
      }
    });
  }
});

router.get({
  authenicate: true,
  path: '/@me',
  async run(req, res) {
    const session = await this.sessions.get(req.connection.remoteAddress);
    const user = await this.database.getUser('id', session.userID);

    const organisations = await Promise.all(user.organisations.map(org => 
      this.database.getOrganisation(org)  
    ));

    const projects = await Promise.all(user.projects.map(project =>
      this.database.getProject(project)  
    ));

    return res.status(200).send({
      statusCode: 200,
      data: {
        organisations: organisations.map(org => ({
          permissions: org.permissions,
          createdAt: org.createdAt,
          projects: org.projects,
          members: org.members,
          github: org.github,
          avatar: org.avatar,
          name: org.name,
          id: org.id
        })),
        contributor: user.contributor,
        description: user.description,
        createdAt: user.created_at,
        translator: user.translator,
        projects: projects.map(project => ({
          translations: project.translations,
          description: project.description,
          completed: project.completed,
          github: project.github,
          avatar: project.avatar,
          owner: project.owner,
          name: project.name,
          id: project.id
        })),
        username: user.username,
        avatar: user.avatar,
        admin: user.admin,
        id: user.id
      }
    });
  }
});

router.put({
  body: [
    ['password', true],
    ['username', true],
    ['email', true]
  ],
  path: '/',
  async run(req, res) {
    const user1 = await this.database.getUser('username', req.body.username);
    if (user1 !== null) return res.status(400).send({
      statusCode: 400,
      message: `Username "${req.body.username}" is already taken`
    });

    const email1 = await this.database.getUser('email', req.body.email);
    if (email1 !== null) return res.status(400).send({
      statusCode: 400,
      message: `Email "${req.body.email}" is already taken`
    });

    const id = await this.database.createUser(req.body.username, req.body.password, req.body.email);
    await this.sessions.create(id, req.connection.remoteAddress);

    return res.status(201).send({
      statusCode: 201,
      data: id
    });
  }
});

router.post({
  body: [
    ['username', true],
    ['password', true]
  ],
  path: '/login',
  async run(req, res) {
    const user = await this.database.getUser('username', req.body.username);
    if (user === null) return res.status(400).send({
      statusCode: 400,
      message: `Username "${req.body.username}" doesn't exist`
    }); 

    if (await this.sessions.exists(user.id)) return res.status(400).send({
      statusCode: 400,
      message: 'User is already logged in'
    });

    const hash = decode(user.password, user.salt, { digest: 'md5' });
    if (!hash) return res.status(403).send({
      statusCode: 403,
      message: 'Password is invalid'
    });

    await this.sessions.create(user.id, req.connection.remoteAddress);
    return res.status(204).send();
  }
});

router.patch({
  authenicate: true,
  body: [
    ['data', true]
  ],
  path: '/@me',
  async run(req, res) {
    const session = await this.sessions.get(req.connection.remoteAddress);

    try {
      const success = await this.database.updateUser(session.userID, req.body.data);
      return res.status(200).send({
        statusCode: 200,
        data: { success }
      });
    } catch(ex) {
      return res.status(500).send({
        statusCode: 500,
        message: `[${ex.name}] ${ex.message.slice(ex.message.indexOf(ex.name) + 1)}`
      });
    }
  }
});

router.delete({
  authenicate: true,
  path: '/:id',
  async run(req, res) {
    const session = await this.sessions.get(req.connection.remoteAddress);

    await this.sessions.remove(req.connection.remoteAddress);
    await this.database.deleteUser(session.userID);
    return res.status(204).send();
  }
});

module.exports = router;