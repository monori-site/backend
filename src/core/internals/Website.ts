import { Logger, ConsoleTransport, FileTransport } from '@augu/logging';
import fastify, { FastifyInstance as Fastify } from 'fastify';
import { HttpClient, middleware } from '@augu/orchid';
import AnalyticsManager from '../managers/AnalyticsManager';
import RoutingManager from '../managers/RoutingManager';
import { join } from 'path';
import Database from '../managers/DatabaseManager';
import session from 'fastify-session';
import fstatic from 'fastify-static';
import cookie from 'fastify-cookie';
import React from '../../middleware/renderReact';
import Redis from 'ioredis';

export interface Configuration {
  /** MongoDB URI */
  databaseUrl: string;

  /** The environment of the application */
  environment: 'development' | 'production';

  /** If we should do analytics (requests and such) */
  analytics: boolean;

  /** Configuration for GitHub OAuth2 */
  github: GitHubConfig;

  /** The secret to use */
  secret: string;

  /** Configuration for Redis */
  redis: RedisServerConfig;

  /** Custom color for the embed */
  color: string;

  /** The port to the server */
  port: number;
}

interface RedisServerConfig {
  host: string;
  port: number;
  db?: number;
}

interface GitHubConfig {
  callbackUrls: { [x in 'development' | 'production']: string }
  clientSecret: string;
  clientID: string;
  scopes: string[];
}

export default class Website {
  public analytics: AnalyticsManager;
  public bootedAt: number;
  public database: Database;
  public routing: RoutingManager;
  private logger: Logger;
  public config: Configuration;
  public server: Fastify;
  public redis: Redis.Redis;
  public http: HttpClient;

  constructor(config: Configuration) {
    this.analytics = new AnalyticsManager(this);
    this.bootedAt = Date.now();
    this.database = new Database(this, config.databaseUrl);
    this.routing = new RoutingManager(this);
    this.logger = new Logger('Website', {
      transports: [new ConsoleTransport(), new FileTransport('./logs/website.log')]
    });
    this.config = config;
    this.server = fastify();
    this.redis = new Redis(config.redis);
    this.http = new HttpClient();

    if (this.config.environment === 'development') this.http.use(middleware.logging({ binding: this.logger.orchid }));
  }

  private addMiddleware() {
    this.server.register(React);
    this.server.register(cookie);
    this.server.register(fstatic, {
      prefix: '/static',
      root: join(process.cwd(), 'static')
    });
    this.server.register(session, {
      secret: this.config.secret,
      store: {
        destroy: (id, callback) => {
          this.logger.info(`Destroying session ${id} from Redis...`);
          this.redis.get(`session:${id}`)
            .then(packet => {
              if (packet === null) {
                this.logger.fatal(`Session "${id}" was not found?`);
                return callback(new Error(`Session "${id}" was not found`));
              }

              this.redis.del(`session:${id}`)
                .then(() => callback())
                .catch(error => callback(error));
            }).catch(error => callback(error));
        },
        set: (id, session, callback) => {
          this
            .redis
            .set(`session:${id}`, JSON.stringify(session))
            .then(() => {
              this.logger.info(`Added session "${id}" with data`, session);
              callback();
            })
            .catch(callback);
        },
        get: (id, callback) => {
          this
            .redis
            .get(`session:${id}`)
            .then((packet) => {
              if (packet === null) return callback(new Error(`Unable to find session ${id}`));

              try {
                JSON.parse(packet);
              } catch {
                return callback(new Error('Data was not seralized properly'));
              }

              callback(undefined, JSON.parse(packet));
            }).catch(callback);
        }
      }
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
      this.logger.fatal('Received an error while processing a request', error);
      reply.render('pages/Error', {
        message: error.message,
        code: 500
      });
    });

    this.server.setNotFoundHandler((request, reply) => {
      this.logger.warn(`Route "${request.raw.method!.toUpperCase()} ${request.req.url}" was not found`);
      reply.render('pages/Error', {
        message: `Route ${request.raw.url} was not found.`,
        code: 500
      });
    });

    this.logger.info('Added all middleware');
  }

  private _addDatabaseEvents() {
    this.database.once('online', () => this.logger.info('Successfully connected to MongoDB'));
    this.database.once('offline', (time) => this.logger.info(`Disconnected from MongoDB (elapsed: ${this._humanize(time)})`));
  }

  private _addRedisEvents() {
    this.redis.once('ready', () => this.logger.info('Connected to Redis'));
    this.redis.on('wait', () => this.logger.warn('Redis has disconnected, awaiting new connection...'));

    if (this.config.environment === 'development') {
      this.logger.info('Adding cache monitoring with Redis...');
      this.redis.monitor((error, monitor) => {
        if (error) this.logger.fatal('Unable to initialise monitor', error);

        this.logger.info('Initialised cache monitoring!');
        monitor.on('monitor', (time: number, args: string[]) => {
          const command = args.shift()!;
          const date = new Date(Math.floor(time) * 1000);

          this.logger.warn(`Executed command "${command}${args.length ? ` ${args.join(':')}` : ''}" at ${date.toLocaleTimeString()}`);
        });
      });
    }
  }

  async serve() {
    this._addRedisEvents();

    this.logger.info('Adding middleware...');
    this.addMiddleware();

    this.logger.info('Built middleware, now building routes...');
    await this.routing.load();

    this.logger.info('Loaded all routers, now connecting to MongoDB...');
    this._addDatabaseEvents();
    await this.database.connect();

    this.logger.info('Booting up server...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.server.listen(this.config.port, (error, address) =>
      error ? this.logger.fatal('Unable to connect to the server', error) : this.logger.info(`Now listening at ${address}.`)
    );
  }

  dispose() {
    this.logger.warn('Disposing connection...');

    this.server.close();
    this.database.disconnect();
    this.redis.disconnect();
  }

  log(type: 'fatal' | 'error' | 'debug' | 'warn' | 'info', ...messages: any[]) {
    this.logger[type](...messages);
  }

  private _humanize(ms: number) {
    const weeks = Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
    ms -= weeks * 1000 * 60 * 60 * 24 * 7;
  
    const days = Math.floor(ms / 1000 / 60 / 60 / 24);
    ms -= days * 1000 * 60 * 60 * 24;
  
    const hours = Math.floor(ms / 1000 / 60 / 60);
    ms -= hours * 1000 * 60 * 60;
  
    const mins = Math.floor(ms / 1000 / 60);
    ms -= mins * 1000 * 60;
  
    const sec = Math.floor(ms / 1000);
  
    let humanized = '';
    if (weeks > 0) humanized += `${weeks} weeks, `;
    if (days > 0) humanized += `${days} days, `;
    if (hours > 0) humanized += `${hours} hours, `;
    if (mins > 0) humanized += `${mins} minutes, `;
    if (sec > 0) humanized += `${sec} seconds`;
  
    return humanized;
  }
}