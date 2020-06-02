import { Logger, ConsoleTransport } from '@augu/logging';
import { RouteDefinition, Website } from '..';
import { Collection } from '@augu/immutable';

export default class BaseRouter {
  private logger: Logger;
  public website: Website;
  public routes: Collection<RouteDefinition>;
  public route: string;

  constructor(website: Website, route: string) {
    this.website = website;
    this.routes = new Collection();
    this.logger = new Logger(`Router ${route}`, { transports: [new ConsoleTransport()] });
    this.route = route;
  }

  register(routes: RouteDefinition[]) {
    for (const route of routes) {
      this.logger.info(`Registering route ${route.path}...`);
      this.routes.set(route.path, route);
    }
  }
}