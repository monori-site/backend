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
import { BaseRouter, Get } from '../struct';

interface Endpoint {
  method: string;
  path: string;
  auth: boolean;
}

export default class MainRouter extends BaseRouter {
  constructor() {
    super('/');
  }

  @Get('/')
  async main(_: FastifyRequest, res: FastifyReply) {
    const endpoints: Endpoint[] = [];
    // this looks bad i know but it works so its gonna be like this :(
    for (const router of this.website.routes.values()) {
      for (const route of router.routes.values()) {
        if (route.admin) continue;
        if (route.prefix === '/favicon.ico') continue;

        endpoints.push({
          method: route.method,
          path: route.prefix,
          auth: route.authenicate  
        });
      }
    }

    return res.status(200).send({
      statusCode: 200,
      endpoints,
      message: 'Welcome to i18n backend! You aren\'t supposed to be here unless you want to use the API.'
    });
  }

  @Get('/favicon.ico')
  async favicon(_: FastifyRequest, res: FastifyReply) {
    return res.status(404).send('Cannot GET /favicon.ico');
  }
}