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
const RedisManager = require('./managers/RedisManager');
const { Signale } = require('signale');
const { version } = require('../../package.json');
const JWTService = require('./services/JWTService');
const Database = require('./Database');
const express = require('express');

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
    this.config = {
      database: {
        username: config.database_username,
        password: config.database_password,
        host: config.database_host,
        port: config.database_port,
        db: config.database_name
      },
      github: {
        clientSecret: config.github_client_secret,
        callbackUrl: config.github_callback_url,
        clientID: config.github_client_id,
        enabled: config.github_enabled,
        scopes: config.github_scopes
      },
      redis: {
        password: config.redis_password,
        host: config.redis_host,
        port: config.redis_port
      },
      environment: config.node_env,
      analytics: config.analytics,
      secret: config.secret,
      port: config.port
    };

    /**
     * Analytics manager
     * @type {AnalyticsManager}
     */
    this.analytics = new AnalyticsManager(this);

    /**
     * Handles all middeware for Express
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
     * Handles all of the routing of the backend API
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
     * @type {import('express').Express}
     */
    this.app = express();

    this.logger.config({ displayBadge: true, displayTimestamp: true });
  }

  /**
   * Adds the needed middleware for Express
   */
  addMiddleware() {
    // Override the powered by header
    this.app.use((_, res, next) => {
      res.setHeader('X-Powered-By', `Monori v${version}; https://github.com/auguwu/Monori`);
      next();
    });
  }

  /**
   * Boots up the server
   */
  async start() {
    this.logger.info('Booting up server...');

    // Before we do anything, lets override the default behaviour of Fastify
    this.analytics.createTimer();

    // Now we can load everything!
    await this.redis.connect();
    await this.routes.load();
    await this.middleware.load();
    await this.database.connect();

    // We loaded everything and connected to Redis and PostgreSQL, let's boot it up!

    /**
     * The http service itself (shouldn't be accessable & used)
     * @type {import('http').Server}
     */
    this._service = this.app.listen(this.config.port, async() => {
      this.logger.info(`Server has booted up at http://localhost:${this.config.port}`);
      await this.sessions.reapply();
    });
  }

  /**
   * Disposes this instance
   */
  dispose() {
    this.redis.dispose();
    this._service.close();
    this.database.dispose();
    this.analytics.stopTimer();
    
    this.logger.warn('Server has been disposed successfully');
  }
};

/**
 * @typedef {object} EnvConfig
 * @prop {string} [github_callback_url] The callback URL
 * @prop {string} [github_client_secret] The client's secret (undefined if it's not enabled)
 * @prop {string} [github_client_id] The client's ID (undefined if it's not enabled)
 * @prop {string[]} [github_scopes] The scopes to use when using the OAuth2 API
 * @prop {string} database_username The database username
 * @prop {string} database_password The database password
 * @prop {string} [redis_password] The password (optional) to connect to Redis
 * @prop {boolean} github_enabled If GitHub OAuth2 is enabled
 * @prop {string} database_host The database host
 * @prop {number} database_port The database port
 * @prop {string} database_name The database's name
 * @prop {string} redis_host The host to connect to Redis
 * @prop {number} redis_port The port to connect to Redis
 * @prop {boolean} analytics If analytics are enabled
 * @prop {'development' | 'production'} node_env The state of the environment
 * @prop {string} secret The JWT secret
 * @prop {number} port The port of the API
 * 
 * @typedef {object} Config
 * @prop {'development' | 'production'} environment The state of the environment
 * @prop {boolean} analytics If analytics are enabled
 * @prop {DatabaseConfig} database The database config
 * @prop {GitHubConfig} github The GitHub OAuth2 config
 * @prop {RedisConfig} redis The redis config
 * @prop {string} secret The JWT secret
 * @prop {number} port The port of the API
 * 
 * @typedef {object} DatabaseConfig
 * @prop {string} username The database username
 * @prop {string} password The database password
 * @prop {string} host The database host
 * @prop {number} port The database port
 * @prop {string} name The database's name
 * 
 * @typedef {object} RedisConfig
 * @prop {string} [password] The password (optional) to connect to Redis
 * @prop {string} host The host to connect to Redis
 * @prop {number} port The port to connect to Redis
 * 
 * @typedef {object} GitHubConfig
 * @prop {string} [clientSecret] The client's secret
 * @prop {string} [callbackUrl] The callback URL
 * @prop {string} [clientID] The client's ID
 * @prop {string[]} [scopes] The scopes to use
 * @prop {boolean} enabled
 */