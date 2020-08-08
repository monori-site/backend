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

import { BaseRouter, Get, Post, Put, Delete, Patch, models } from '../struct';
import type { FastifyReply, FastifyRequest } from 'fastify';
import JWT, { TokenStatus } from '../util/JWT';
import { pipelines } from '@augu/maru';
import * as Hash from '../struct/internals/hash';

type GetUserRequest = FastifyRequest<{
  Params: {
    id: string;
  }
}>;

type PatchSelfRequest = FastifyRequest<{
  Body: {
    data: { [x: string]: any }
  }
}>;

type PutUserRequest = FastifyRequest<{
  Body: {
    username: string;
    password: string;
    email: string;
  }
}>;

type PostLoginRequest = FastifyRequest<{
  Body: {
    username: string;
    password: string;
  }
}>;

export default class UserAPIRouter extends BaseRouter {
  constructor() {
    super('/api/users');
  }

  @Get('/users/:id', {
    parameters: [
      {
        required: true,
        name: 'id'
      }
    ]
  })
  async getUser(req: GetUserRequest, res: FastifyReply) {
    const user = await this
      .website
      .connection
      .query<models.User>(pipelines.Select('users', ['username', req.params.id!]), false);

    if (user === null) {
      return res.status(404).send({
        statusCode: 404,
        message: `User with username "${req.params.id}" was not found`
      });
    } else {
      return res.status(200).send({
        statusCode: 200,
        data: {
          organisations: user.organisations,
          contributor: user.contributor,
          translator: user.translator,
          username: user.username,
          projects: user.projects,
          github: user.github || 'none',
          email: user.email
        }
      });
    }
  }

  @Get('/users/@me', {
    authenicate: true
  })
  async getSelfUser(req: FastifyRequest, res: FastifyReply) {
    // Why not cast it to Session only?
    // `authenicate` in the decorator's 2nd argment basically checks
    // concurrent sessions (if they exist or not), so it's not needed.
    // Also, I'll have to make it non nullable, so using assertions is fine (for now)
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const user = await this
      .website
      .connection
      .query<models.User>(pipelines.Select('users', ['username', session!.username]), false);

    return res.status(200).send({
      statusCode: 200,
      data: {
        organisations: user!.organisations,
        contributor: user!.contributor,
        translator: user!.translator,
        username: user!.username,
        projects: user!.projects,
        session: {
          expiresAt: (Date.now() - (session!.startedAt + 604800000)),
          id: session!.sessionID
        },
        github: user!.github || 'none',
        email: user!.email
      }
    });
  }

  @Get('/users/@me/jwt', { authenicate: true })
  async getJwt(req: FastifyRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const user = await this
      .website
      .connection
      .query<models.User>(pipelines.Select('users', ['username', session!.username]), false);

    if (user!.jwt === null) {
      const token = JWT.issue(user!.username, user!.password);

      await this.website.connection.query(pipelines.Update({
        values: {
          jwt: token
        },
        table: 'token',
        type: 'set'
      }), false);
      return res.status(200).send({
        statusCode: 200,
        data: {
          token
        }
      });
    } else {
      const decoded = JWT.decode(user!.jwt);
      if (!decoded.username) {
        switch (decoded.status) {
          case TokenStatus.Expired: {
            const token = JWT.issue(user!.username, user!.password);
            const resp = await this.website.connection.query<any>(pipelines.Update({
              returning: ['jwt'],
              values: {
                jwt: token
              },
              table: 'token',
              type: 'set'
            }), false);
      
            return res.status(200).send({
              statusCode: 200,
              data: {
                token: resp.jwt
              }
            });
          }

          case TokenStatus.Invalid: {
            return res.status(401).send({
              statusCode: 401,
              message: decoded.reason!
            });
          }

          case TokenStatus.Unknown: {
            return res.status(401).send({
              statusCode: 401,
              message: 'Unable to decode token, try again later'
            });
          }
        }
      } else {
        return res.status(200).send({
          statusCode: 200,
          data: { token: user!.jwt }
        });
      }
    }
  }

  @Post('/users/@me/jwt/generate', { authenicate: true })
  async generateJWT(req: FastifyRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const batch = this
      .website
      .connection
      .createBatch()
      .pipe(pipelines.Select('users', ['username', session!.username]));

    const user = await batch.next<models.User>();
    const token = JWT.issue(user!.username, user!.password);
    const query = await this.website.connection.query<{ jwt: string }>(pipelines.Update({
      returning: ['jwt'],
      values: {
        jwt: token
      },
      table: 'token',
      type: 'set'
    }), false);

    return res.status(200).send({
      statusCode: 200,
      data: {
        token: query!.jwt
      }
    });
  }

  @Patch('/users/@me', {
    authenicate: true,
    body: [
      {
        required: true,
        name: 'data'
      }
    ]
  })
  async updateSelf(req: PatchSelfRequest, res: FastifyReply) {
    const obj = {};
    if (req.body.data.hasOwnProperty('contributor')) {
      if (typeof req.body.data.contributor !== 'boolean') return res.status(406).send({
        statusCode: 406,
        message: `"contributor" must be a boolean (received ${typeof req.body.data.contributor})`
      });

      // don't feel like adding types to `obj`
      obj['contributor'] = req.body.data.contributor;
    }

    if (req.body.data.hasOwnProperty('translator')) {
      if (typeof req.body.data.translator !== 'boolean') return res.status(406).send({
        statusCode: 406,
        message: `"translator" must be a boolean (received ${typeof req.body.data.contributor})`
      });

      // don't feel like adding types to `obj`
      obj['translator'] = req.body.data.translator;
    }

    if (req.body.data.hasOwnProperty('username')) {
      if (typeof req.body.data.username !== 'string') return res.status(406).send({
        statusCode: 406,
        message: `"username" must be a string (received ${typeof req.body.data.username})`
      });

      const batch = this.website.connection.createBatch()
        .pipe(pipelines.Select('users', ['username', req.body.data.username]));

      const first = await batch.next<models.User>();
      if (first === null) {
        obj['username'] = req.body.data.username;
      } else {
        return res.status(406).send({
          statusCode: 406,
          message: `Username "${req.body.data.username}" is already taken!`
        });
      }
    }

    try {
      await this.website.connection.query(pipelines.Update({
        values: obj,
        table: 'users',
        type: 'set'
      }), false);
      return res.status(200).send({
        statusCode: 200,
        data: {
          updated: true
        }
      });
    } catch(ex) {
      return res.status(500).send({
        statusCode: 500,
        message: ex.message
      });
    }
  }

  // TODO: Add authenication on this bitch
  @Put('/users', {
    body: [
      {
        required: true,
        name: 'password'
      },
      {
        required: true,
        name: 'username'
      },
      {
        required: true,
        name: 'email'
      }
    ]
  })
  async createUser(req: PutUserRequest, res: FastifyReply) {
    const batch = this.website.connection.createBatch()
      .pipe(pipelines.Select('users', ['username', req.body.username]))
      .pipe(pipelines.Select('users', ['email', req.body.email]));

    const result = await batch.next<models.User>();
    if (result !== null) return res.status(500).send({
      statusCode: 500,
      message: `User with username "${req.body.username}" already exists`
    });

    const emailRes = await batch.next<models.User>();
    if (emailRes !== null) return res.status(500).send({
      statusCode: 500,
      message: `User with email "${req.body.email}" already exists`
    });

    await this.website.connection.query(pipelines.Insert<models.User>({
      values: {
        organisations: [],
        contributor: false,
        translator: false,
        username: req.body.username,
        password: req.body.password,
        projects: [],
        github: null,
        email: req.body.email,
        hash: Hash.encrypt(req.body.password),
        jwt: null
      },
      table: 'users'
    }), false);

    return res.status(201).send();
  }

  @Delete('/users/@me', {
    authenicate: true
  })
  async deleteUser(req: FastifyRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);

    await this.website.connection.query(pipelines.Delete('users', ['username', session!.username]), false);
    await this.website.sessions.removeSession(req.connection.remoteAddress!);
    return res.status(204).send({ statusCode: 204 });
  }

  @Get('/users/@me/projects', { authenicate: true })
  async getUserProjects(req: FastifyRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const projects = await this.website.connection.query<models.Project[]>(pipelines.Select('projects', ['owner', session!.username]), true);
    if (projects === null) return res.status(404).send({
      statusCode: 404,
      message: 'Current user hasn\'t made any projects.'
    });

    return res.status(200).send({
      statusCode: 200,
      data: projects
    });
  }

  @Get('/users/@me/organisations', { authenicate: true })
  async getUserOrgs(req: FastifyRequest, res: FastifyReply) {
    const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
    const orgs = await this.website.connection.query<models.Organisation[]>(pipelines.Select('organisations', ['owner', session!.username]), true);

    if (orgs === null) return res.status(404).send({
      statusCode: 404,
      message: 'Current user hasn\'t made any projects.'
    });

    return res.status(200).send({
      statusCode: 200,
      data: orgs
    });
  }

  @Post('/users/login', {
    body: [
      {
        required: true,
        name: 'username'
      },
      {
        required: true,
        name: 'password'
      }
    ]
  })
  async login(req: PostLoginRequest, res: FastifyReply) {
    if (await this.website.sessions.exists(req.connection.remoteAddress!)) return res.status(500).send({
      statusCode: 500,
      message: 'User has an concurrent session, continue'
    });

    const user = await this.website.connection.query<models.User>(pipelines.Select('users', ['username', req.body.username]), false);
    if (user === null) return res.status(404).send({
      statusCode: 404,
      message: `User "${req.body.username}" doesn't exist?`
    });

    const encrypt = Hash.check(user.hash, user.password, { digest: 'md5' });
    if (!encrypt) return res.status(401).send({
      statusCode: 401,
      message: 'Invalid password.'
    });

    await this.website.sessions.createSession(user.username, user.jwt!, req.connection.remoteAddress!);
    return res.status(204).send();
  }
}