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

import type { Server as HttpServer } from 'http';
import type { EnvConfig, Config } from '../util/models';
import type { AddressInfo } from 'net';
import MiddlewareManager from './managers/MiddlewareManager';
import AnalyticsManager from './managers/AnalyticsManager';
import RoutingManager from './managers/RoutingManager';
import SessionManager from './managers/SessionManager';
import { Stopwatch } from './Stopwatch';
import { Logger } from './Logger';
import Database from './Database';
import express from 'express';
import Redis from './Redis';
import os from 'os';

export class Server {
  public middleware: MiddlewareManager;
  public analytics: AnalyticsManager;
  private _server!: HttpServer;
  public sessions: SessionManager;
  public database: Database;
  public routing: RoutingManager;
  private logger: Logger;
  public healthy: boolean;
  public config: Config;
  public redis: Redis;
  public app: express.Application;

  constructor(config: EnvConfig) {
    this.config = {
      frontendUrl: config.FRONTEND_URL,
      environment: config.NODE_ENV,
      analytics: {
        features: config.ANALYTICS_FEATURES,
        enabled: config.ANALYTICS
      },
      database: {
        activeConnections: config.DATABASE_ACTIVE_CONNECTIONS || 3,
        username: config.DATABASE_USERNAME,
        password: config.DATABASE_PASSWORD,
        host: config.DATABASE_HOST,
        name: config.DATABASE_NAME,
        port: config.DATABASE_PORT
      },
      github: {
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackUrl: config.GITHUB_CALLBACK_URL,
        clientID: config.GITHUB_CLIENT_ID,
        enabled: config.GITHUB_ENABLED,
        scopes: config.GITHUB_SCOPES
      },
      redis: {
        password: config.REDIS_PASSWORD,
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
        db: config.REDIS_DB_ID || 7
      },
      port: config.PORT
    };

    this.middleware = new MiddlewareManager(this);
    this.analytics  = new AnalyticsManager(this);
    this.sessions   = new SessionManager(this);
    this.database   = new Database(this.config.database);
    this.routing    = new RoutingManager(this);
    this.healthy    = false;
    this.logger     = new Logger();
    this.redis      = new Redis(this.config.redis);
    this.app        = <any> express();
    // never do this but issue a pr if you know how to fix the below issue:

    /// Type 'Express' is not assignable to type 'Application'.
    ///   Types of property 'locals' are incompatible.
    ///     Property 'server' is missing in type 'Record<string, any>' but required in type '{ [x: string]: any; server: Server; }'.ts(2322)
  }

  async load() {
    this.logger.info('Now loading basic components...');

    const stopwatch = new Stopwatch();
    stopwatch.start();

    await this.analytics.start();
    await this.middleware.load();
    await this.routing.load();
    this.database.connect();
    this.redis.connect();

    const time = stopwatch.end();
    this.logger.info(`Loaded basic components in ${time.toFixed(2)}ms, now booting service...`);

    const watch = new Stopwatch();
    watch.start();

    this._server = this.app.listen(this.config.port, async() => {
      this.app.locals.server = this;

      const time = watch.end();
      const address = this._server.address();
      if (address === null) {
        this.logger.info(`Now listening at http://localhost:${this.config.port} (~${time.toFixed(2)}ms)`);

        await this.sessions.reapply();
        return;
      }

      const isUnixSocket = typeof address === 'string';
      let host!: string;

      if (!isUnixSocket) {
        const addr = <AddressInfo> address;
        if (addr.address.indexOf(':') === -1) {
          host = `${addr.address}:${addr.port}`;
        } else {
          host = `127.0.0.1:${addr.port}`;
        }
      }

      host = isUnixSocket ? '' : `http://${host}`;
      this.logger.info(`Now listening at ${host} (~${time.toFixed(2)}ms)`);
      await this.sessions.reapply();
    });
  }

  /**
   * Disposes all components
   */
  dispose() {
    this.logger.warn('Now disposing all components...');

    this.analytics.dispose();
    this.database.disconnect();
    this.redis.disconnect();
    this._server.close();

    this.logger.warn('Disposed all components');
  }
}
