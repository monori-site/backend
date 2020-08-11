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

/**
 * Represents middleware for a Fastify route
 */
module.exports = class Middleware {
  /**
   * Creates a new [Middleware] instance
   * @param {string} name The middleware's name
   */
  constructor(name) {
    /**
     * The middleware's name
     * @type {string}
     */
    this.name = name;
  }

  /**
   * Injects the [Server] instance to this [Middleware] instance
   * @param {import('./Server')} server The server
   */
  init(server) {
    /**
     * The server instance
     * @type {import('./Server')}
     */
    this.server = server;

    return this;
  }

  /**
   * Function to call this [Middleware] when a route is requested
   * @param {import('fastify').FastifyRequest} req The request
   * @param {import('fastify').FastifyReply} res The response
   * @param {(error?: import('fastify').FastifyError) => void} done Callback function to make this [Middleware] instance done
   */
  async run(req, res, done) {
    throw new SyntaxError(`Midding override function in middleware "${this.name}": run(req, res, done)`);
  }
};