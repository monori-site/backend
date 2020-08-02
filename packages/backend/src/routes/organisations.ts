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

type DeleteOrgRequest = GetOrgRequest;
type GetOrgRequest = FastifyRequest<{
  Params: {
    uuid: string;
  }
}>;

type PutOrgRequest = FastifyRequest<{
  Body: {
    name: string;
  }
}>;

type PatchOrgRequest = FastifyRequest<{
  Params: {
    uuid: string;
  }

  Body: {
    name: string;
    data: { [x: string]: any }
  }
}>;

export default class OrganisationAPIRouter extends BaseRouter {
  constructor() {
    super('/api/organisations');
  }

  @Get('/:uuid', {
    parameters: [
      {
        required: true,
        name: 'uuid'
      }
    ]
  })
  async getOrg(req: GetOrgRequest, res: FastifyReply) {
    const org = await this.website.connection.query<models.Organisation>(pipelines.Select('organisations', ['name', req.params.uuid]), false);
  
    if (org === null) return res.status(404).send({ statusCode: 404, message: `Organisation ${req.params.uuid} doesn't exist` });
    else return res.status(200).send({
      statusCode: 200,
      data: org
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
  async newOrg(req: PutOrgRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const batch = this.website.connection.createBatch()
      .pipe(pipelines.Select('organisations', ['name', req.body.name]))
      .pipe(pipelines.Insert<models.Organisation>({
        values: {
          projects: [],
          members: [],
          owner: session!.username,
          name: req.body.name
        },
        table: 'organisations'
      }));

    const result = await batch.next<models.Organisation>();
    if (result !== null) return res.status(500).send({
      statusCode: 500,
      message: `Organisation by name "${req.body.name}" already exists!`
    });

    await batch.next(); // Execute the Insert pipe
    return res.status(204).send();
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
      },
      {
        required: true,
        name: 'name'
      }
    ]
  })
  async updateProject(req: PatchOrgRequest, res: FastifyReply) {
    const updates = {};
    if (req.body.data.includes('members')) {
      // JavaScript is kinda weird
      // You're saying "why tho?"
      //
      // Remember this: Arrays are basically enumerable objects
      // You can still place data with `arr[index] = value`
      // and it'll be inserted to the array.
      //
      // The point is, we need to type-check so we won't cause
      // any crashes and segfaults in the database, since
      // that can happen. :/
      if (typeof req.body.data.members === 'object' && !Array.isArray(req.body.data.members)) {
        if (!req.body.data.members.includes('add') || !req.body.data.members.includes('remove')) return res.status(406).send({
          statusCode: 406,
          message: 'Missing "add" or "remove" operators'
        });

        const org = await this.website.connection.query<models.Organisation>(pipelines.Select('organisations', ['name', req.body.name]), false);
        updates['members'] = [].concat(<any> org!.members);

        if (req.body.data.members.hasOwnProperty('add')) {
          if (!Array.isArray(req.body.data.members.add)) return res.status(406).send({
            statusCode: 406,
            message: '"add" must be an Array of member usernames'
          });

          for (let i = 0; i < req.body.data.members.add.length; i++) {
            const memberID = req.body.data.members.add[i];

            if (!org!.members.includes(memberID)) updates['members'].push(memberID);
            else return res.status(406).send({
              statusCode: 406,
              message: `Member "${memberID}" is already in the list?`
            });
          }
        }

        if (req.body.data.members.hasOwnProperty('remove')) {
          if (!Array.isArray(req.body.data.members.remove)) return res.status(406).send({
            statusCode: 406,
            message: 'The "remove" operator must be an Array of member usernames'
          });
        }

        for (let i = 0; i < req.body.data.members.remove.length; i++) {
          const memberID = req.body.data.members.remove[i];
          if (org!.members.includes(memberID)) {
            const index = updates['members'].indexOf(memberID);
            if (index !== -1) {
              updates['members'].splice(index, 1);
            }
          } else {
            return res.status(406).send({
              statusCode: 406,
              message: `Member "${memberID}" isn't apart of this organisation`
            });
          }
        }
      } else {
        return res.status(406).send({
          statusCode: 406,
          message: `Expected an object, received ${typeof req.body.data.members}`
        });
      }
    }

    if (req.body.data.includes('name')) {
      if (typeof req.body.data.name !== 'string') return res.status(406).send({
        statusCode: 406,
        message: `"name" must be a string, received ${typeof req.body.data.name}`
      });

      const result = await this.website.connection.query(pipelines.Select('organisations', ['name', req.body.name]), false);
      if (result === null) {
        updates['name'] = req.body.data.name;
      } else {
        return res.status(406).send({
          statusCode: 406,
          message: `Organisation name "${req.body.data.name}" is already taken.`
        });
      }
    }

    try {
      await this.website.connection.query(pipelines.Update({
        values: updates,
        query: ['name', req.body.name],
        table: 'organisations',
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
  async deleteOrg(req: DeleteOrgRequest, res: FastifyReply) {
    const org = await this.website.connection.query<models.Organisation>(pipelines.Select('organisations', ['name', req.params.uuid]), false);
    if (org === null) return res.status(404).send({
      statusCode: 404,
      message: `Organisation with name "${req.params.uuid}" doesn't exist`
    });

    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const isOwner = await this.website.connection.query<models.Project>(pipelines.Select('organisations', ['owner', session!.username]), true)
      .then((result) => result === null || result.some(arr => arr.owner === session!.username));

    if (!isOwner) return res.status(403).send({
      statusCode: 403,
      message: `User ${session!.username} is not an owner of organisation ${org.name}`
    });

    await this.website.connection.query(pipelines.Delete('organisations', ['name', req.params.uuid]), false);
    return res.status(204).send();
  }
}