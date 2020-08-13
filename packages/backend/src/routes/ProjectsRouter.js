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
const router = new Router('/projects');

router.get({
  parameters: [
    ['id', true]
  ],
  path: '/:id',
  async run(req, res) {
    const project = await this.database.getProject(req.params.id);
    if (project === null) return res.status(404).send({
      statusCode: 404,
      message: `Project with ID "${req.params.id}" wasn't found`
    });

    return res.status(200).send({
      statusCode: 200,
      data: {
        translations: project.translations,
        description: project.description,
        completed: project.completed,
        github: project.github,
        avatar: project.avatar,
        owner: project.owner,
        name: project.name,
        id: project.id
      }
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
    const id = await this.database.createProject(req.body.name, session.userID);

    return res.status(201).send({
      statusCode: 201,
      data: id
    });
  }
});

router.delete({
  authenicate: true,
  body: [
    ['id', true]
  ],
  path: '/',
  async run(req, res) {
    await this.database.deleteProject(req.body.id);
    return res.status(204).send();
  }
});

router.patch({
  authenicate: true,
  parameters: [
    ['id', true]
  ],
  body: [
    ['data', true]
  ],
  path: '/:id',
  async run(req, res) {
    try {
      await this.database.updateProject(req.body.data);
    } catch(ex) {
      return res.status(500).send({
        statusCode: 500,
        message: `[${ex.name}] ${ex.message.slice(ex.message.indexOf(ex.name) + 1)}`
      });
    }
  }
});

router.put({
  authenicate: true,
  parameters: [
    ['id', true]
  ],
  path: '/translations/add',
  async run(req, res) {
    const project = await this.database.getProject(req.params.id);
    if (project === null) return void 0;
  }
});

module.exports = router;