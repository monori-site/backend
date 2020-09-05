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
import ClusteringManager from './managers/ClusteringManager';
import AnalyticsManager from './managers/AnalyticsManager';
import RoutingManager from './managers/RoutingManager';
import SessionManager from './managers/SessionManager';
import { Stopwatch } from './Stopwatch';
import { Logger } from './Logger';
import MasterIPC from './clustering/ipc/MasterIPC';
import Database from './Database';
import express from 'express';
import Redis from './Redis';
import os from 'os';

export class Server {
  public middleware: MiddlewareManager;
  public analytics: AnalyticsManager;
  private _server!: HttpServer;
  public clusters: ClusteringManager;
  public sessions: SessionManager;
  public database: Database;
  public routing: RoutingManager;
  private logger: Logger;
  public healthy: boolean;
  public config: Config;
  public redis: Redis;
  public ipc: MasterIPC;
  public app: express.Application;

  constructor(config: EnvConfig) {
    this.config = {
      frontendUrl: config.FRONTEND_URL,
      environment: config.NODE_ENV,
      clustering: {
        clusterCount: config.CLUSTER_WORKER_COUNT || os.cpus().length,
        retryLimit: config.CLUSTER_RETRY_LIMIT || 5,
        ipcPort: config.CLUSTER_IPC_PORT || 4200
      },
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
    this.clusters   = new ClusteringManager(this);
    this.sessions   = new SessionManager(this);
    this.database   = new Database(this.config.database);
    this.routing    = new RoutingManager(this);
    this.healthy    = false;
    this.logger     = new Logger();
    this.redis      = new Redis(this.config.redis);
    this.ipc        = new MasterIPC(this);
    this.app        = <any> express(); // never do this but issue a pr if you know how to fix the below issue:

    /// Type 'Express' is not assignable to type 'Application'.
    ///   Types of property 'locals' are incompatible.
    ///     Property 'server' is missing in type 'Record<string, any>' but required in type '{ [x: string]: any; server: Server; }'.ts(2322)
  }

  async load(log = false) {
    if (log) this.logger.info('Now loading basic components...');

    const stopwatch = new Stopwatch();
    stopwatch.start();

    await this.analytics.start(log);
    this.database.connect(log);
    this.redis.connect(log);

    const time = stopwatch.end();
    this.logger.info(`Loaded basic components in ${time.toFixed(2)}ms, now launching workers...`);

    const watch = new Stopwatch();
    watch.start();

    this.clusters.start(log)
      .then(() => {
        const time = watch.end();
        if (log) this.logger.info(`Completed clustering in ${time.toFixed(2)}ms`);
      })
      .catch((error) => {
        const time = watch.end();
        if (log) this.logger.error(`Unable to complete clustering in ${time.toFixed(2)}ms`, error);
      });
  }

  /**
   * Listens to the server
   */
  async listen(log = false) {
    const cluster: typeof import('cluster') = require('cluster');
    this.logger.info('Now loading basic components...');

    const stopwatch = new Stopwatch();
    stopwatch.start();

    await this.middleware.load(log);
    await this.analytics.start(log);
    await this.routing.load(log);
    this.database.connect(log);
    this.redis.connect(log);
    this.app.locals.server = this;

    const time = stopwatch.end();
    this.logger.info(`Loaded basic components in ${time.toFixed(2)}ms, now launching server for worker #${cluster.worker.id}`);
    this._server = this.app.listen(this.config.port, () => {
      const address = this._server.address();
      if (address === null) {
        this.logger.info(`Worker #${process.env.CLUSTER_ID} | Now listening at http://localhost:${this.config.port}`);
        return;
      }

      const isUnixSocket = typeof address === 'string';
      let host!: string;

      if (!isUnixSocket) {
        const addr = <AddressInfo> address;
        if (addr.address.indexOf(':') === -1) {
          host = `${addr.address}:${addr.port}`;
        } else {
          host = `localhost:${addr.port}`;
        }
      }

      host = isUnixSocket ? '' : `http://${host}`;
      this.logger.info(`Worker #${process.env.CLUSTER_ID} | Now listening at ${host}`);
    });
  }

  /**
   * Disposes all components
   */
  dispose(log = false) {
    this.logger.warn('Now disposing all components...');

    this.analytics.dispose();
    this.database.disconnect(log);
    this.clusters.kill();
    this.redis.disconnect(log);

    this.logger.warn('Disposed all components');
  }

  /**
   * Closes the server
   */
  close() {
    this._server.close();
  }
}
