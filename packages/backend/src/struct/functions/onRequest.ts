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

import type { Website, Route, BaseRouter, models } from '..';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { pipelines } from '@augu/maru';
import JWT, { TokenStatus } from '../../util/JWT';

async function reissue(this: Website, user: models.User): Promise<[boolean, string | undefined]> {
  if (user.jwt === null) {
    const token = JWT.issue(user.username, user.password);
    const batch = this.connection.createBatch()
      .pipe(pipelines.Update({
        returning: ['jwt'],
        values: {
          jwt: token
        },
        table: 'users',
        type: 'set'
      }));

    await batch.next(); // Execute it
    return <any> [true, token];
  }

  const decoded = JWT.decode(user.jwt!);
  if (decoded.hasOwnProperty('reason')) {
    switch (decoded.status) {
      case TokenStatus.Expired: {
        const token = JWT.issue(user.username, user.password);
        const query = await this.connection.query<any>(pipelines.Update({
          returning: ['jwt'],
          values: {
            jwt: token
          },
          table: 'users',
          type: 'set'
        }), false);
    
        return <any> [true, query.jwt];
      }

      case TokenStatus.Invalid: return <any> [false, undefined];
      case TokenStatus.Unknown: return <any> [false, undefined];
      default: return <any> [true, user.jwt!];
    }
  } else {
    return [true, user.jwt!];
  }
}

/**
 * Does the routing portion
 * @param req The request
 * @param res The reply
 * @param route The current route
 * @param router The current router
 */
export default async function onRequest(
  this: Website, 
  req: FastifyRequest, 
  res: FastifyReply, 
  route: Route, 
  router: BaseRouter
): Promise<void> {
  this.analytics.inc('request');

  if (route.method !== req.method.toLowerCase()) return res.status(405).send({
    statusCode: 405,
    message: `Expected "${route.method.toLowerCase()} ${req.url}" but gotten "${req.method.toUpperCase()} ${req.url}"`
  });

  if (route.authenicate) {
    switch (route.type) {
      case 'jwt': {
        const session = await this.sessions.getSession(req.connection.remoteAddress!);
        const user = await this.connection.query<models.User>(pipelines.Select('users', ['username', session!.username]), false);
        
        if (user === null) return res.status(401).send({
          statusCode: 401,
          message: 'No session has been created, please login'
        });

        // Reissue if it's invalid
        const [success, token] = await reissue.apply(this, [user]);
        const hasToken = user.jwt === undefined || token === undefined 
          ? false 
          : user.jwt !== token;

        if (!success && !hasToken) return res.status(401).send({
          statusCode: 401,
          message: 'JWT token is invalid, please re-generate a new token'
        });
      } break;

      default: {
        const session = await this.sessions.getSession(req.connection.remoteAddress!);
        const user = await this.connection.query<models.User>(pipelines.Select('users', ['username', session!.username]), false);

        if (user === null) return res.status(401).send({
          statusCode: 401,
          message: 'No session has been created, please login'
        });
      } break;
    }
  }

  if (route.admin) {
    const session = await this.sessions.getSession(req.connection.remoteAddress!);
    const user = await this.connection.query<models.User>(pipelines.Select('users', ['username', session!.username]), false);

    if (user === null) return res.status(401).send({
      statusCode: 401,
      message: 'No session has been created, please login'
    });

    if (!user!.admin) return res.status(403).send({ statusCode: 401 });
  }

  if (route.parameters.length) {
    const denied = route.parameters.some(param => param.required && !(<any> req.params).hasOwnProperty(param.name));
    if (denied) {
      const all = route.parameters.filter(param =>
        param.required && (<any> req.params).hasOwnProperty(param.name)
      );

      return res.status(400).send({
        statusCode: 400,
        message: 'Missing the following query parameters',
        missing: all.map(param => param.name)
      });
    }
  }

  if (route.parameters.length) {
    const denied = route.parameters.some(param => param.required && !(<any> req.params).hasOwnProperty(param.name));
    if (denied) {
      const all = route.parameters.filter(param =>
        param.required && (<any> req.params).hasOwnProperty(param.name)
      );

      return res.status(400).send({
        statusCode: 400,
        message: 'Missing the following query parameters',
        missing: all.map(param => param.name)
      });
    }
  }

  if (route.queries.length) {
    const denied = route.queries.some(param => param.required && !(<any> req.query).hasOwnProperty(param.name));
    if (denied) {
      const all = route.queries.filter(param =>
        param.required && (<any> req.query).hasOwnProperty(param.name)
      );

      const params = all.map((param, index) => `${(index + 1) === 1 ? '?' : '&'}${param.name}`);
      return res.status(400).send({
        statusCode: 400,
        message: 'Missing the following queries',
        missing: params
      });
    }
  }

  if (route.body.length) {
    const denied = route.body.some(param => param.required && !(<any> req.body).hasOwnProperty(param.name));
    if (denied) {
      const all = route.body.filter(param =>
        param.required && (<any> req.body).hasOwnProperty(param.name)
      );

      return res.status(400).send({
        statusCode: 400,
        message: 'Missing the following query parameters',
        missing: all.map(param => param.name)
      });
    }
  }

  try {
    await route.run.apply(router, [req, res]);
  } catch (ex) {
    return res.status(500).send({
      statusCode: 500,
      message: 'Unable to process request',
      error: `[${ex.name}]: ${ex.message}`
    });
  }
}