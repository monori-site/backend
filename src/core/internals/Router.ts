import { Logger, ConsoleTransport } from '@augu/logging';
import { RouteDefinition, Website } from '..';
import { randomBytes } from 'crypto';
import { Collection } from '@augu/immutable';

export default class BaseRouter {
  private logger: Logger;
  public website: Website;
  public routes: Collection<RouteDefinition>;
  public prefix: string;

  constructor(website: Website, prefix: string) {
    this.website = website;
    this.routes = new Collection();
    this.logger = new Logger(`Router ${prefix}`, { transports: [new ConsoleTransport()] });
    this.prefix = prefix;
  }

  register(routes: RouteDefinition[]) {
    for (const route of routes) {
      const path = route.path === '/' ? this.prefix : `${this.prefix === '/' ? '' : this.prefix}${route.path}`;
      route.path = path;

      this.routes.set(randomBytes(4).toString('hex'), route);
      this.logger.info(`Registered route ${path}!`);
    }
  }
}