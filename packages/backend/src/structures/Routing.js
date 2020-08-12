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
   * @param {RouteOptions} opts The options
   */
  constructor(method, opts) {
    /**
     * If we should use the Authenication middleware
     * @type {boolean}
     */
    this.authenicate = opts.hasOwnProperty('authenicate') ? opts.authenicate : false;

    /**
     * List of "required" parameters
     * @type {[string, boolean][]}
     */
    this.parameters = opts.hasOwnProperty('parameters') ? opts.parameters : [];

    /**
     * List of "required" query parameters
     * @type {[string, boolean][]}
     */
    this.queries = opts.hasOwnProperty('queries') ? opts.queries : [];

    /**
     * The route's method
     * @type {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'}
     */
    this.method = method;

    /**
     * If we should the Admin middleware
     * @type {boolean}
     */
    this.admin = opts.hasOwnProperty('admin') ? opts.admin : false;

    /**
     * List of "required" request body params
     * @type {[string, boolean][]}
     */
    this.body = opts.hasOwnProperty('body') ? opts.body : [];
    
    /**
     * The path of the route
     * @type {string}
     */
    this.path = opts.path;

    /**
     * The route's callback
     * @type {RouteRunner}
     */
    this.run = opts.run;
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
   * Returns a list of endpoints in this Router
   * @returns {string[]} A list of endpoints
   */
  getEndpoints() {
    const endpoints = [];
    this.routes.forEach(route => endpoints.push(`${route.method} ${route.path}`));

    return endpoints;
  }

  /**
   * Adds a route to this router
   * @param {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} method The method
   * @param {RouteOptions} opts The options to use
   * @returns {this} This router for chaining methods
   */
  add(method, opts) {
    if (opts.authenicate && typeof opts.authenicate !== 'boolean') throw new TypeError(`Expecting 'boolean' but received ${typeof opts.authenicate}`);
    if (opts.parameters && !Array.isArray(opts.parameters)) throw new TypeError(`Expecting an array but received ${typeof opts.parameters}`);
    if (opts.queries && !Array.isArray(opts.queries)) throw new TypeError(`Expecting an array but received ${typeof opts.queries}`);
    if (opts.admin && typeof opts.admin !== 'boolean') throw new TypeError(`Expecting 'boolean' but received ${typeof opts.admin}`);
    if (opts.body && !Array.isArray(opts.body)) throw new TypeError(`Expecting an array but received ${typeof opts.body}`);
    if (!Methods.includes(method)) throw new TypeError(`Expecting ${Methods.join(', ')} but gotten ${method}`);
    if (!opts.run || !opts.path) throw new SyntaxError('Missing "run" or "path" in opts');

    const prefix = Route.prefix(opts.path, this.prefix);
    opts.path = prefix;

    const route = new Route(method, opts);
    this.routes.set(prefix, route);
    return this;
  }

  /**
   * Adds a GET method to the router
   * @param {RouteOptions} opts The options to use
   * @returns {this} This router for chaining methods
   */
  get(opts) {
    return this.add('GET', opts);
  }

  /**
   * Adds a PUT method to the router
   * @param {RouteOptions} opts The options to use
   * @returns {this} This router for chaining methods
   */
  put(opts) {
    return this.add('PUT', opts);
  }

  /**
   * Adds a POST method to the router
   * @param {RouteOptions} opts The options to use
   * @returns {this} This router for chaining methods
   */
  post(opts) {
    return this.add('POST', opts);
  }

  /**
   * Adds a DELETE method to the router
   * @param {RouteOptions} opts The options to use
   * @returns {this} This router for chaining methods
   */
  delete(opts) {
    return this.add('DELETE', opts);
  }

  /**
   * Adds a PATCH method to the router
   * @param {RouteOptions} opts The options to use
   * @returns {this} This router for chaining methods
   */
  patch(opts) {
    return this.add('PATCH', opts);
  }
}

module.exports = { Router, Route };

/**
 * @typedef {import('fastify').FastifyRequest} Request
 * @typedef {import('fastify').FastifyReply} Response
 * @typedef {(this: import('./Server'), req: Request, res: Response) => Promise<void>} RouteRunner
 * @typedef {Router} Router
 * @typedef {Route} Route
 * 
 * @typedef {object} RouteOptions
 * @prop {boolean} [authenicate] If we require the Authenication middleware
 * @prop {[string, boolean][]} [parameters] List of parameters that are(n't) required by the route
 * @prop {[string, boolean][]} [queries] List of query params that are(n't) required by the route
 * @prop {'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT'} method The method to use
 * @prop {boolean} [admin] If this route requires administrator
 * @prop {[string, boolean][]} [body] List of the request body that are(n't) required by the route
 * @prop {string} path The path to the route
 * @prop {RouteRunner} run Executes the path
 */