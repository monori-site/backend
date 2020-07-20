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

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { Website, Route, BaseRouter } from '../internals';
import JWT from '../../util/JWT';

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
  //  if (route.authenicate) {
  //    const bucket = this.redis.getBucket(`session:${req.raw.connection.remoteAddress}`);
  //    const item = await bucket.get();
  //
  //    if (!item) {
  //      return res.status(403).send({
  //        statusCode: 403,
  //        message: 'Session has not been created, please login or signup.'
  //      });
  //    }
  //
  //    if (item && item.expired) {
  //      return res.status(403).send({
  //        statusCode: 403,
  //        message: 'Session has expired, please relogin to return to this page.'
  //      });
  //    }
  //  }
  //
  //  if (route.admin) {
  //    const bucket = this.redis.getBucket(`sessions:${req.raw.connection.remoteAddress}`);
  //    const item = await bucket.get();
  //
  //    if (!item) {
  //      return res.status(403).send({
  //        statusCode: 403,
  //        message: 'Session has not been created, please login or signup.'
  //      });
  //    }
  //
  //    if (item.expired) {
  //      return res.status(403).send({
  //        statusCode: 403,
  //        message: 'Session has expired, please relogin to return to this page.'
  //      });
  //    } else {
  //      const repo = this.database.getRepository('users');
  //      const user = await repo.get('id', item.userID);
  //
  //      if (user && !user.admin) return res.status(401).send({
  //        statusCode: 401,
  //        message: 'User is not an admin'
  //      });
  //   }
  //  }

  if (route.authenicate) {
    switch (route.type) {
      case 'jwt': {
        const bucket = this.jwt.getBucket();
        
      } break;
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

// Old code I had, ignore this (will be used in this soon)
/*
    // Check if we have the "auth" requirement
    if (route.requirements.auth) {
      // If the request is missing the "Authorization" header
      if (!req.headers.authorization) return res.status(401).send({
        statusCode: 401,
        message: 'Missing "Authorization" header in the request.'
      });

      // Check the authenication type for authenication
      switch (route.requirements.authType) {
        // Authenicate with JWT
        case 'jwt': {
          if (!req.headers.authorization.startsWith('Bearer ')) return res.status(403).send({
            statusCode: 403,
            message: 'JWT token doesn\'t start with "Bearer"'
          });

          const token = req.headers.authorization.split(' ')[1];
          const decoded = JWT.decode(token);

          if (decoded.error) return res.status(403).send({
            statusCode: 403,
            message: decoded.error
          });
        } break;

        // Account token authenication
        case 'account': {
          if (!req.headers.authorization.startsWith('Account ')) return res.status(403).send({
            statusCode: 403,
            message: 'Account token doesn\'t start with "Account"'
          });

          const token = req.headers.authorization.split(' ')[1];
          const account = await server.database.getAccountByToken(token);
          
          if (!account || account === null) return res.status(401).send({
            statusCode: 401,
            message: 'Authenication token was invalid'
          });
        } break;
      }
    }
  }

  // Check for any query parameters and see if they are missing
  if (route.requirements.queries && route.requirements.queries.length) {
    const denied = route.requirements.queries.some(x => x.required && !req.query[x.name]);
    
    if (denied) {
      const all = route.requirements.queries.filter(x => x.required && !req.query[x.name]);
      return res.status(400).send({
        statusCode: 400,
        message: `Missing required queries: ${all.map(s => s.name).join(', ')}`
      });
    }
  }

  // Check for any parameters and see if they are missing
  if (route.requirements.parameters && route.requirements.parameters.length) {
    const denied = route.requirements.parameters.some(x => x.required && !req.params[x.name]);

    if (denied) {
      const all = route.requirements.parameters.filter(x => x.required && !req.params[x.name]);
      return res.status(400).send({
        statusCode: 400,
        message: `Missing required parameters: ${all.map(s => s.name).join(', ')}`
      });
    }
  }

  // Check for any specific payload in the body
  if (route.requirements.body && route.requirements.body.length) {
    const denied = route.requirements.body.some(x => x.required && !req.body[x.name]);
    
    if (denied) {
      const all = route.requirements.body.filter(x => x.required && !req.body[x.name]);
      return res.status(400).send({
        statusCode: 400,
        message: `Missing required body payload: ${all.map(x => x.name).join(', ')}`
      });
    }
  }

*/