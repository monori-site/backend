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

const { Collection } = require('@augu/immutable');

const Methods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'];

/**
 * Represents a [Route] class, which basically indicates this route is a normal
 * route when making a request in the browser
 */
class Route {
  /**
   * Creates a new [Route] instance
   * @param {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} method The method
   * @param {string} path The path
   * @param {RouteRunner} run The run function
   */
  constructor(method, path, run) {
    /**
     * The route's method
     * @type {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'}
     */
    this.method = method;
    
    /**
     * The path of the route
     * @type {string}
     */
    this.path = path;

    /**
     * The route's callback
     * @type {RouteRunner}
     */
    this.run = run;
  }

  /**
   * Returns this route's prefix
   * @param {string} curr The current prefix
   * @param {string} other The other prefix
   */
  static prefix(curr, other) {
    return curr === '/'
      ? other
      : `${other === '/' ? '' : other}${curr}`;
  }
}

/**
 * Represents a [Router], which basically is a container
 * for all routes injected using [Router.add]
 */
class Router {
  /**
   * Creates a new [Router] instance
   * @param {string} prefix The router's prefix
   */
  constructor(prefix) {
    /**
     * The router's prefix
     * @type {string}
     */
    this.prefix = prefix;

    /**
     * The container for all routes
     * @type {Collection<Route>}
     */
    this.routes = new Collection();
  }

  /**
   * Initialises this router
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
   * Adds a route to this router
   * @param {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} method The method
   * @param {string} path The path
   * @param {RouteRunner} run The run function
   * @returns {this} This router for chaining methods
   */
  add(method, path, run) {
    if (!Methods.includes(method)) throw new TypeError(`Expecting ${Methods.join(', ')} but gotten ${method}`);

    const func = run.bind(this.server);
    const prefix = Route.prefix(path, this.prefix);
    const route = new Route(method, prefix, func);

    this.routes.set(prefix, route);
    return this;
  }

  /**
   * Adds a GET method to the router
   * @param {string} path The path
   * @param {RouteRunner} run The run function
   * @returns {this} This router for chaining methods
   */
  get(path, run) {
    return this.add('GET', path, run);
  }

  /**
   * Adds a PUT method to the router
   * @param {string} path The path
   * @param {RouteRunner} run The run function
   * @returns {this} This router for chaining methods
   */
  put(path, run) {
    return this.add('PUT', path, run);
  }

  /**
   * Adds a POST method to the router
   * @param {string} path The path
   * @param {RouteRunner} run The run function
   * @returns {this} This router for chaining methods
   */
  post(path, run) {
    return this.add('POST', path, run);
  }

  /**
   * Adds a DELETE method to the router
   * @param {string} path The path
   * @param {RouteRunner} run The run function
   * @returns {this} This router for chaining methods
   */
  delete(path, run) {
    return this.add('DELETE', path, run);
  }

  /**
   * Adds a PATCH method to the router
   * @param {string} path The path
   * @param {RouteRunner} run The run function
   * @returns {this} This router for chaining methods
   */
  patch(path, run) {
    return this.add('PATCH', path, run);
  }
}

module.exports = { Router, Route };

/**
 * @typedef {import('fastify').FastifyRequest} Request
 * @typedef {import('fastify').FastifyReply} Response
 * @typedef {(this: import('./Server'), req: Request, res: Response) => Promise<void>} RouteRunner
 * @typedef {Router} Router
 * @typedef {Route} Route
 */