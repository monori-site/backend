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
import { Logger, createLogger } from '@augu/logging';
import AnalyticsManager from '../managers/AnalyticsManager';
import DatabaseManager from '../managers/DatabaseManager';
import RoutingManager from '../managers/RoutingManager';
import CronJobManager from '../managers/JobManager';
import ConfigManager from '../managers/ConfigManager';
import RedisManager from '../managers/RedisManager';
import { EventBus } from '.';
import ratelimit from 'fastify-rate-limit';
import { sleep } from '../../util';

// eslint-disable-next-line
type Events = {
  disposed: () => void;
  online: () => void;
};

export class Website extends EventBus<Events> {
  public analytics: AnalyticsManager;
  public database: DatabaseManager;
  public bootedAt: number;
  private logger: Logger;
  public config: ConfigManager;
  public routes: RoutingManager;
  public server: Server;
  public redis: RedisManager;
  public jobs: CronJobManager;

  constructor() {
    super();

    // javascript sometimes i hate u smh
    this.config = new ConfigManager();
    this.analytics = new AnalyticsManager(this);
    this.database = new DatabaseManager(this);
    this.bootedAt = Date.now();
    this.logger = createLogger('Website', { file: './logs/website.log' });
    this.routes = new RoutingManager(this);
    this.server = fastify();
    this.redis = new RedisManager(this);
    this.jobs = new CronJobManager(this);
  }

  private addMiddleware() {
    this.logger.info('Adding middleware to Fastify...');
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
      this.logger.warn(`Router "${req.raw.method!.toUpperCase()} ${req.raw.url}" was not found`);
      res.status(500).send({
        statusCode: 500,
        message: `Router "${req.raw.method!.toUpperCase()} ${req.raw.url}" was not found`
      });
    });
  }

  private addDbEvents() {
    this.database.once('online', () => this.logger.info('Connected to PostgreSQL'));
    this.database.once('offline', () => this.logger.info('Disconnected from PostgreSQL successfully'));
  }

  private addRedisEvents() {
    this.redis.once('online', () => this.logger.info('Connected to Redis successfully'));
    this.redis.once('offline', () => this.logger.info('Disconnected from Redis successfully'));
  }

  async load() {
    this.addDbEvents();
    this.addRedisEvents();
    this.addMiddleware();

    this.logger.info('Built events and middleware, now building routes...');
    await this.routes.load();

    this.logger.info('Loaded all routes! Now connecting to PostgreSQL...');
    await this.database.connect();

    this.logger.info('Connected to PostgreSQL! Now connecting to Redis...');
    await this.redis.connect();

    this.logger.info('Connected to Redis! Now loading server...');
    await sleep(2000);

    this.server.listen(this.config.get<number>('port', 6969), (error) => {
      if (error) {
        this.logger.error('Unable to load server', error);
        process.exitCode = 1;
      }

      this.emit('online');
    });
  }

  dispose() {
    this.server.close();
    this.database.dispose();
    this.redis.disconnect();

    this.emit('disposed');
  }
}