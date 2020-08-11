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
 * Represents a service-class of handling all routing
 */
module.exports = class RouterService {
  /**
   * Creates a new [RouterService] instance
   * @param {import('../Server')} server The server instance
   */
  constructor(server) {
    /**
     * The server instance
     * @type {import('../Server')}
     */
    this.server = server;
  }

  /**
   * Injects all of the routes to Fastify
   * @param {import('../Routing').Router} router The router
   */
  inject(router) {
    for (const [path, route] of router.routes) {
      this.server.app[route.method.toLowerCase()](path, async (req, res) => 
        this.invoke(route, req, res)
      );
    }
  }

  /**
   * Invokes the service
   * @param {import('../Routing').Route} route The route
   * @param {import('fastify').FastifyRequest} req The request
   * @param {import('fastify').FastifyReply} res The response
   */
  async invoke(route, req, res) {
    // TODO: validate parameters, body, and query params
    for (const middleware of this.server.middleware.values()) await middleware.run(req, res);

    try {
      await route.run.apply(this.server, [req, res]);
    } catch(ex) {
      return res.status(500).send({
        statusCode: 500,
        message: 'Unexpected error has occured, view the result below',
        error: `[${ex.name}] ${ex.message}`
      });
    }
  }
};