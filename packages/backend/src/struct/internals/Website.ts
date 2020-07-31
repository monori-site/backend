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

import fastify, { FastifyInstance as Server } from 'fastify';
import { Dialect, Connection } from '@augu/maru';
import AnalyticsManager from '../managers/AnalyticsManager';
import RoutingManager from '../managers/RoutingManager';
import SessionManager from '../managers/SessionManager';
import RedisManager from '../managers/RedisManager';
import { EventBus } from '.';
import { Signale } from 'signale';
import ratelimit from 'fastify-rate-limit';
import { models } from '..';
import { sleep } from '../../util';

// eslint-disable-next-line
type Events = {
  disposed: () => void;
  online: () => void;
};

export interface Config {
  GITHUB_CLIENT_SECRET: string | null;
  GITHUB_CALLBACK_URL: string | null;
  DATABASE_USERNAME: string;
  DATABASE_PASSWORD: string;
  GITHUB_CLIENT_ID: string | null;
  GITHUB_ENABLED: boolean;
  REDIS_PASSWORD: string | null;
  DATABASE_PORT: number;
  DATABASE_HOST: string;
  DATABASE_NAME: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  ANALYTICS: boolean;
  NODE_ENV: 'development' | 'production';
  SECRET: string;
  PORT: number;
}

export class Website extends EventBus<Events> {
  public connection!: Connection;
  public analytics: AnalyticsManager;
  public sessions: SessionManager;
  public bootedAt: number;
  private logger: Signale;
  public routes: RoutingManager;
  public server: Server;
  public redis: RedisManager;
  private maru: Dialect;

  constructor() {
    super();

    this.analytics = new AnalyticsManager(this);
    this.sessions = new SessionManager(this);
    this.bootedAt = Date.now();
    this.logger = new Signale({ scope: 'Website ' });
    this.routes = new RoutingManager(this);
    this.server = fastify();
    this.redis = new RedisManager(this);
    this.maru = new Dialect({
      activeConnections: 1,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT
    });
  }

  private addMiddleware() {
    this.server.register(ratelimit, {
      timeWindow: 3600000,
      max: 1000
    });

    this.server.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_, body, next) => {
      try {
        const data = JSON.parse(body.toString());
        next(null, data);
      } catch(ex) {
        ex.statusCode = 500;
        this.logger.fatal('Unable to parse body payload', ex);
        next(ex);
      }
    });

    this.server.setErrorHandler((error, _, reply) => {
      this.logger.fatal('Unable to process request', error);
      reply.status(500).send({
        statusCode: 500,
        message: 'Fatal error occured while processing',
        error: `[${error.name}]: ${error.message}`
      });
    });

    this.server.setNotFoundHandler((req, res) => {
      this.logger.warn(`Route "${req.raw.method!.toUpperCase()} ${req.raw.url}" was not found`);
      res.status(500).send({
        statusCode: 500,
        message: `Route "${req.raw.method!.toUpperCase()} ${req.raw.url}" was not found`
      });
    });
  }

  private addRedisEvents() {
    this.redis.once('online', () => this.logger.info('Connected to Redis successfully'));
    this.redis.once('offline', () => this.logger.warn('Disconnected from Redis successfully'));
  }

  async load() {
    this.addRedisEvents();
    this.addMiddleware();

    await this.routes.load();
    this.connection = this.maru.createConnection();
    await this.connection.connect();
    await this.redis.connect();
    await this._createTables();

    this.logger.info('Now booting server...');
    await sleep(2000);

    this.server.listen(process.env.PORT, (error) => {
      if (error) {
        this.logger.error('Unable to load server', error);
        process.exit(1);
      }

      this.emit('online');
    });
  }

  dispose() {
    this.server.close();
    this.redis.disconnect();

    this.emit('disposed');
  }

  private async _createTables() {
    const { pipelines } = await import('@augu/maru');
    this.logger.info('Creating database tables (if they don\'t exist...)');

    await this.connection.query(pipelines.CreateTable<models.User>('users', {
      values: {
        organisations: {
          nullable: false,
          primary: false,
          type: 'array'
        },
        contributor: {
          nullable: false,
          primary: false,
          type: 'boolean'
        },
        translator: {
          nullable: false,
          primary: false,
          type: 'boolean'
        },
        username: {
          nullable: false,
          primary: true,
          type: 'string'
        },
        password: {
          nullable: false,
          primary: false,
          type: 'string'
        },
        projects: {
          nullable: false,
          primary: false,
          type: 'array'
        },
        admin: {
          nullable: false,
          primary: false,
          type: 'boolean'
        },
        github: {
          nullable: true,
          primary: false,
          type: 'string'
        },
        hash: {
          nullable: false,
          primary: false,
          type: 'string'
        },
        jwt: {
          nullable: true,
          primary: false,
          type: 'string'
        }
      }
    }), false);

    await this.connection.query(pipelines.CreateTable<models.Project>('projects', {
      values: {
        translations: {
          nullable: false,
          primary: false,
          type: 'array'
        },
        github: {
          nullable: true,
          primary: false,
          type: 'string'
        },
        owner: {
          nullable: false,
          primary: false,
          type: 'string'
        },
        name: {
          nullable: false,
          primary: true,
          type: 'string'
        }
      }
    }), false);
  }
}

/*
export interface Project {
  translations: Translation[];
  github: string | null;
  owner: string;
  name: string;
}

interface Translation {
  filePath: string | null;
  branch: string | null;
  owner: string;
  code: string;
}
*/