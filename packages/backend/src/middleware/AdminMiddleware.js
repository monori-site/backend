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

module.exports = class AdminMiddleware extends Middleware {
  constructor() {
    super('admin');
  }

  /**
   * Checks if the user has administrator permissions
   * @param {import('fastify').FastifyRequest} req The request
   * @param {import('fastify').FastifyReply} res The response
   */
  async run(req, res) {
    const session = await this.server.sessions.get(req.connection.remoteAddress);
    const user = await this.server.database.getUser(session.userID);
    if (user === null) return res.status(404).send({
      statusCode: 404,
      message: 'User has concurrent session, yet doesn\'t exist?'
    });

    if (!user.admin) return res.status(403).send({
      statusCode: 403,
      message: 'User is not an administrator'
    });
  }
};