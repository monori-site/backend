import { Logger, ConsoleTransport, FileTransport } from '@augu/logging';
import { HttpClient, middleware } from '@augu/orchid';
import AnalyticsManager from '../managers/AnalyticsManager';
import RoutingManager from '../managers/RoutingManager';
import Database from '../managers/DatabaseManager';
import React from '../../middleware/renderReact';

import fastify, {
  FastifyReply as Response,
  FastifyRequest as Request,
  FastifyInstance as Fastify
} from 'fastify';

export interface Configuration {
  /** MongoDB URI */
  databaseUrl: string;

  /** If we should do analytics (requests and such) */
  analytics: boolean;

  /** The port to the server */
  port: number;
}

export default class Website {
  public analytics: AnalyticsManager;
  public bootedAt: number;
  public database: Database;
  public routing: RoutingManager;
  private logger: Logger;
  public config: Configuration;
  public server: Fastify;
  public http: HttpClient;

  constructor(config: Configuration) {
    this.analytics = new AnalyticsManager(this);
    this.bootedAt = Date.now();
    this.database = new Database(this);
    this.routing = new RoutingManager(this);
    this.logger = new Logger('Website', {
      transports: [new ConsoleTransport(), new FileTransport('./logs/website.log')]
    });
    this.config = config;
    this.server = fastify();
    this.http = new HttpClient();

    this
      .http
      .use(middleware.logging({ binding: this.logger.orchid() }))
      .use(middleware.forms());
  }

  private addMiddleware() {
    this.server.register(React);
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
      reply.render('pages/NotFound', {
        route: request.req.url ?? 'https://i18n.augu.dev'
      });
    });

    this.logger.info('Added all middleware');
  }

  private _addDatabaseEvents() {
    this.database.once('online', () => this.logger.info('Successfully connected to MongoDB'));
    this.database.once('offline', (time) => this.logger.info(`Disconnected from MongoDB (elapsed: ${this.bootedAt - time})`));
  }

  async serve() {
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
}