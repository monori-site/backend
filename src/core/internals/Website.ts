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

  private onRequest() {

  }

  private addHooks() {

  }

  private addMiddleware() {

  }

  serve() {
    
  }
}