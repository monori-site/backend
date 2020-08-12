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

const { Middleware } = require('../structures');

module.exports = class AuthenicateMiddleware extends Middleware {
  constructor() {
    super('auth');
  }

  /**
   * Checks if the user has administrator permissions
   * @param {import('fastify').FastifyRequest} req The request
   * @param {import('fastify').FastifyReply} res The response
   */
  async run(req, res) {
    // Check if we can use the IP address to fetch a session
    if (!req.connection.hasOwnProperty('remoteAddress')) return res.status(500).send({
      statusCode: 500,
      message: 'Unable to validate session due to no IP address being shown'
    });

    // Check if it exists, if not let's throw a 401
    if (!(await this.server.sessions.exists(req.connection.remoteAddress))) return res.status(401).send({
      statusCode: 401,
      message: 'No session has been created, ignoring'
    });
  }
};