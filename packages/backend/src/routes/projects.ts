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

import { BaseRouter, Get, Put, Delete, Patch, models } from '../struct';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { pipelines } from '@augu/maru';

type DeleteProjectRequest = GetProjectRequest;
type GetProjectRequest = FastifyRequest<{
  Params: {
    uuid: string;
  }
}>;

type PutProjectRequest = FastifyRequest<{
  Body: {
    name: string;
  }
}>;

type PatchProjectRequest = FastifyRequest<{
  Params: {
    uuid: string;
  }

  Body: {
    data: { [x: string]: any }
  }
}>;

export default class ProjectsAPIRouter extends BaseRouter {
  constructor() {
    super('/api/projects');
  }

  @Get('/:uuid', {
    parameters: [
      {
        required: true,
        name: 'uuid'
      }
    ]
  })
  async getProject(req: GetProjectRequest, res: FastifyReply) {
    const project = await this.website.connection.query<models.Project>(pipelines.Select('projects', ['name', req.params.uuid]), false);
    if (project === null) return res.status(404).send({
      statusCode: 404,
      message: `Project with name "${req.params.uuid}" doesn't exist`
    });

    return res.status(200).send({
      statusCode: 404,
      data: project
    });
  }

  @Put('/', {
    authenicate: true,
    body: [
      {
        required: true,
        name: 'name'
      }
    ]
  })
  async newProject(req: PutProjectRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const batch = this.website.connection.createBatch()
      .pipe(pipelines.Select('projects', ['name', req.body.name]))
      .pipe(pipelines.Insert<models.Project>({
        values: {
          translations: [],
          github: null,
          owner: session!.username,
          name: req.body.name
        },
        table: 'projects'
      }));

    const result = await batch.next<models.Project>();
    if (result !== null) return res.status(500).send({
      statusCode: 500,
      message: `Project by name "${req.body.name}" exists`
    });

    await batch.next(); // Execute the insert pipe
    return res.status(201).send({ statusCode: 201 });
  }

  @Patch('/:uuid', {
    authenicate: true,
    parameters: [
      {
        required: true,
        name: 'uuid'
      }
    ],
    body: [
      {
        required: true,
        name: 'data'
      }
    ]
  })
  async updateProject(req: PatchProjectRequest, res: FastifyReply) {
    const updates = {};
    if (req.body.data.hasOwnProperty('translations')) {
      if (!Array.isArray(req.body.data.translations)) return res.status(406).send({
        statusCode: 406,
        message: '"translations" must be an Array of objects'
      });

      updates['translations'] = req.body.data.translations;
    }

    if (req.body.data.hasOwnProperty('name')) {
      if (typeof req.body.data.name !== 'string') return res.status(406).send({
        statusCode: 406,
        message: `"username" must be a string (received ${typeof req.body.data.name})`
      });

      const result = await this.website.connection.query(pipelines.Select('projects', ['name', req.body.data.name]), false);
      if (result === null) {
        updates['name'] = req.body.data.name;
      } else {
        return res.status(406).send({
          statusCode: 406,
          message: `Name ${req.body.data.name} is already taken`
        });
      }
    }

    try {
      await this.website.connection.query(pipelines.Update({
        values: updates,
        table: 'projects',
        type: 'set'
      }), false);

      return res.status(204).send();
    } catch(ex) {
      return res.status(500).send({
        statusCode: 500,
        message: `[${ex.name}] ${ex.message}`
      });
    }
  }

  @Delete('/:uuid', {
    authenicate: true,
    parameters: [
      {
        required: true,
        name: 'uuid'
      }
    ]
  })
  async deleteProject(req: DeleteProjectRequest, res: FastifyReply) {
    const project = await this.website.connection.query<models.Project>(pipelines.Select('projects', ['name', req.params.uuid]), false);
    if (project === null) return res.status(404).send({
      statusCode: 404,
      message: `Project with name "${req.params.uuid}" doesn't exist`
    });

    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const isOwner = await this.website.connection.query<models.Project>(pipelines.Select('projects', ['owner', session!.username]), true)
      .then((result) => result === null || result.some(arr => arr.owner === session!.username));

    if (!isOwner) return res.status(403).send({
      statusCode: 403,
      message: `User "${session!.username}" is not the owner of project "${project.name}"`
    });

    await this.website.connection.query(pipelines.Delete('projects', ['name', project.name]), false);
    return res.status(204).send();
  }
}