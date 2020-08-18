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

const e = require('express');

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
    const core = e.Router();
    for (const [other, route] of router.routes) {
      const [method, path] = other.split(':');
      core[method](path, (req, res) => this.invoke.apply(this, [route, req, res]));
    }

    this.server.app.use(router.prefix, core);
  }

  /**
   * Invokes the service
   * @param {import('../Routing').Route} route The route
   * @param {import('express').Request} req The request
   * @param {import('express').Response} res The response
   */
  async invoke(route, req, res) {
    if (route.method !== req.method) return res.status(405).send({
      statusCode: 405,
      message: `Expected "${route.method} ${route.path}" but gotten "${req.method} ${req.url}"`
    });

    if (route.authenicate) this.server.middleware.get('auth').run(req, res);
    if (route.admin) this.server.middleware.get('admin').run(req, res);

    if (route.parameters.length) {
      const denied = route.parameters.some(([param, required]) =>
        required ? (req.params.hasOwnProperty(param) ? false : true) : false
      );

      if (denied.length) return res.status(400).send({
        statusCode: 400,
        message: `Missing the following parameters: ${route.parameters.filter(([param, required]) => required && !req.params.hasOwnProperty(param)).join(', ')}`
      });
    }

    if (route.queries.length) {
      const denied = route.queries.some(([param, required]) =>
        required ? (req.query.hasOwnProperty(param) ? false : true) : false
      );

      if (denied.length) return res.status(400).send({
        statusCode: 400,
        message: `Missing the following queries: ${route.queries.filter(([param, required]) => required && !req.params.hasOwnProperty(param)).map(([param], index) => index === 0 ? `?${param}` : `&${param}`).join(', ')}`
      });
    }

    if (route.body.length) {
      const denied = route.queries.some(([param, required]) =>
        required ? (req.body.hasOwnProperty(param) ? false : true) : false
      );

      if (denied.length) return res.status(400).send({
        statusCode: 400,
        message: `Missing the following request body: ${route.body.filter(([param, required]) => required && !req.params.hasOwnProperty(param)).join(', ')}`
      });
    }

    try {
      await route.run.apply(this.server, [req, res]);
    } catch(ex) {
      this.server.logger.error(`Unexpected error occured in route "${route.method} ${route.path}"\n`, ex);
      return res.status(500).send({
        statusCode: 500,
        message: 'Unexpected error has occured, view the result below',
        error: `[${ex.name}] ${ex.message}`
      });
    }
  }
};