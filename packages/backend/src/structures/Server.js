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

const MiddlewareManager = require('./managers/MiddlewareManager');
const AnalyticsManager = require('./managers/AnalyticsManager');
const SessionManager = require('./managers/SessionManager');
const RoutingManager = require('./managers/RoutingManager');
const PluginManager = require('./managers/PluginManager');
const RedisManager = require('./managers/RedisManager');
const { Signale } = require('signale');
const JWTService = require('./services/JWTService');
const Database = require('./Database');
const fastify = require('fastify');

/**
 * Represents the bare-minimum API server, which handles everything
 * under the hood
 * 
 * - hi yes i am bad at explaining :(
 */
module.exports = class Server {
  /**
   * Creates a new [Server] instance
   * @param {EnvConfig} config The configuration from [dotenv.parse]
   */
  constructor(config) {
    /**
     * The configuration as an object
     * @type {Config}
     */
    this.config = {};

    /**
     * Analytics manager
     * @type {AnalyticsManager}
     */
    this.analytics = new AnalyticsManager(config.analytics_enabled);

    /**
     * Handles all middeware for Fastify (View [here](https://www.fastify.io/docs/latest/Hooks/#onrequest) for more information)
     * @type {MiddlewareManager}
     */
    this.middleware = new MiddlewareManager(this);

    /**
     * Handles all user sessions
     * @type {SessionManager}
     */
    this.sessions = new SessionManager(this);

    /**
     * Handles all the database stuff with PostgreSQL
     * @type {Database}
     */
    this.database = new Database(this);

    /**
     * Handles all of the plugins for Fastify (View [here](https://www.fastify.io/docs/latest/Plugins-Guide/) for more information)
     * @type {PluginManager}
     */
    this.plugins = new PluginManager(this);

    /**
     * Handles all of the routing of Fastify (View [here](https://www.fastify.io/docs/latest/Routes/) for more information)
     * @type {RoutingManager}
     */
    this.routes = new RoutingManager(this);
  
    /**
     * Logger instance
     * @type {import('signale').Signale}
     */
    this.logger = new Signale({ scope: 'Server' });

    /**
     * Redis connection manager
     * @type {RedisManager}
     */
    this.redis = new RedisManager(this);

    /**
     * Handles JWT access tokens
     * @type {JWTService}
     */
    this.jwt = new JWTService(config.secret);

    /**
     * Actual Fastify instance
     * @type {import('fastify').FastifyInstance}
     */
    this.app = fastify();
  }

  /**
   * Adds the needed middleware for Fastify
   */
  addMiddleware() {
    // Overrides the default JSON serializer
    this.app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_, body, next) => {
      try {
        next(null, JSON.parse(body.toString()));
      } catch(ex) {
        ex.statusCode = 500;
        this.logger.fatal('Unable to parse payload from client', ex);

        next(ex);
      }
    });

    // Adds the 'onRequest' hook, which basically is
    // when a user made a request, let's verify
    // all of the middleware we use
    this.app.addHook('onRequest', async (req, res, done) => {
      for (const middleware of this.middleware.values()) await middleware.run(req, res);
    });

    // Overrides the default error handler
    this.app.setErrorHandler((error, _, reply) => {
      this.logger.fatal('Unable to process request', error);
      reply.status(500).send({
        statusCode: 500,
        message: 'Unable to process due to a fatal error',
        error: `[${error.name}] ${error.message}`
      });
    });

    // Overrides the default 404 handler
    this.app.setNotFoundHandler((req, res) => res.status(404).send({
      statusCode: 404,
      message: `Route "${req.raw.method.toUpperCase()} ${req.raw.url}" was not found`
    }));
  }

  /**
   * Boots up the server
   */
  async start() {
    this.logger.info('Booting up server...');

    // Before we do anything, lets override the default behaviour of Fastify
    this.addMiddleware();

    // Now we can load everything!
    await this.routes.load();
    await this.plugins.load();
    await this.middleware.load();
    await this.database.connect();
    this.redis.connect();

    // We loaded everything and connected to Redis and PostgreSQL, let's boot it up!
    this.app.listen(this.config.port, (error, address) => {
      if (error) {
        this.logger.fatal('Unable to connect to the server', error);

        this.dispose();
        process.exit(1);
      } else {
        this.logger.info(`-> Server has booted up at ${address}`);
      }
    });
  }

  /**
   * Disposes this instance
   */
  dispose() {
    this.app.close();
    this.redis.dispose();
    this.database.dispose();

    this.logger.warn('* Server has been disposed successfully');
  }
};