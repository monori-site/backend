import { Logger, ConsoleTransport, FileTransport } from '@augu/logging';
import fastify, { FastifyInstance as Fastify } from 'fastify';
import { HttpClient, middleware } from '@augu/orchid';
import AnalyticsManager from '../managers/AnalyticsManager';
import RoutingManager from '../managers/RoutingManager';
import { join } from 'path';
import Database from '../managers/DatabaseManager';
import session from '../../middleware/session/mod';
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
  discord: DiscordConfig;

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

interface DiscordConfig {
  callbackUrls: { [x in 'development' | 'production']: string }
  clientSecret: string;
  clientID: string;
  scopes: string[];
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

    this
      .http
      .use(middleware.logging({ binding: this.logger.orchid() }))
      .use(middleware.forms());
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
        delete: async (sessionID) => {
          try {
            const packet = await this.redis.get(`session:${sessionID}`);
            if (packet === null) return;

            await this.redis.del(`session:${sessionID}`);
          } catch {
            return;
          }
        },
        create: async (session) => {
          try {
            await this.redis.set(`session:${session.sessionID}`, JSON.stringify(session.toJSON()));
          } catch {
            return;
          }
        },
        get: async (sessionID, callback) => {
          try {
            const packet = await this.redis.get(`session:${sessionID}`);
            if (packet === null) callback(new Error('Unable to find session'));

            callback(null, JSON.parse(packet!));
          } catch(ex) {
            callback(ex);
          }
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
      this.logger.warn(`Route "${request.raw.method?.toUpperCase()} ${request.req.url}" was not found`);
      reply.render('pages/Error', {
        message: `Route ${request.raw.url} was not found.`,
        code: 500
      });
    });

    this.logger.info('Added all middleware');
  }

  private _addDatabaseEvents() {
    this.database.once('online', () => this.logger.info('Successfully connected to MongoDB'));
    this.database.once('offline', (time) => this.logger.info(`Disconnected from MongoDB (elapsed: ${this.bootedAt - time})`));
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

          this.logger.warn(`Executed command "${command} ${args.join(':')}" at ${date.toLocaleTimeString()}`);
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
}