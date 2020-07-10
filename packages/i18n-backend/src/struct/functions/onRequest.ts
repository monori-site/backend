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
import type { Website, Route } from '../internals';

type i18nEnv = 'development' | 'production';

/**
 * uwu whats this?
 * @param req owo
 * @param res owo
 */
export default async function onRequest(this: Website, req: FastifyRequest, res: FastifyReply, route: Route) {
  this.analytics.inc('request');
  if (route.authenicate) {
    const bucket = this.redis.getBucket(`session:${req.raw.connection.remoteAddress}`);
    const item = await bucket.get();

    if (item.expired) {
      return res.status(403).send({
        statusCode: 403,
        message: 'Session has expired, please relogin to return to this page.'
      });
    }
  }

  if (route.admin) {
    const bucket = this.redis.getBucket(`sessions:${req.raw.connection.remoteAddress}`);
    const item = await bucket.get();

    if (item.expired) {
      return res.status(403).send({
        statusCode: 403,
        message: 'Session has expired, please relogin to return to this page.'
      });
    } else {
      const repo = this.database.getRepository('users');
      const user = await repo.get('id', item.userID);

      if (user && !user.admin) return res.status(401).send({
        statusCode: 401,
        message: 'User is not an admin'
      });
    }
  }


}