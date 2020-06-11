import { Website, BaseRouter as Router, getRoutes, RouteDefinition } from '..';
import { promises as fs, existsSync } from 'fs';
import { Logger, ConsoleTransport } from '@augu/logging';
import type { UserModel } from '../repository/UserRepository';
import { Collection } from '@augu/immutable';
import { join } from 'path';

export default class RoutingManager extends Collection<Router> {
  private website: Website;
  public logger: Logger;
  public path: string;

  constructor(website: Website) {
    super();

    this.website = website;
    this.logger = new Logger('RoutingManager', { transports: [new ConsoleTransport()] });
    this.path = join(process.cwd(), 'routes');
  }

  async load() {
    this.logger.info('Now loading routers...');

    const stats = await fs.stat(this.path);
    if (!existsSync(this.path)) {
      this.logger.error(`Path ${this.path} doesn't exist.`);
      process.exit(1);
    }

    if (!stats.isDirectory()) {
      this.logger.error(`Path ${this.path} wasn't a directory.`);
      process.exit(1);
    }

    const routes = await fs.readdir(this.path);
    if (!routes.length) {
      this.logger.error(`Path ${this.path} didn't have any routers.`);
      process.exit(1);
    }

    this.logger.info(`Found ${routes.length} routers!`);
    for (const router of routes) {
      const { default: file } = await import(join(this.path, router));
      const instance: Router = new file(this.website);

      if (!(instance instanceof Router)) {
        this.logger.warn(`Router ${router.split('.').shift()} is not a valid router.`);
        continue;
      }

      const all = getRoutes(instance);
      if (!all.length) {
        this.logger.warn(`Router ${instance.prefix} doesn't include any routes.`);
        continue;
      }

      instance.register(all);
      this.set(instance.prefix, instance);

      for (const route of all) this.onRequest(instance, route);
      this.logger.info(`Injected router ${instance.prefix} with ${all.length} routes!`);
    }
  }

  private onRequest(router: Router, route: RouteDefinition) {
    this.logger.info(`Added route ${route.path}`);
    this.website.server[route.method.toLowerCase()](route.path, async (req, res) => {
      if (this.website.config.environment === 'development') this.logger.info(`${req.raw.method!.toUpperCase()} ${req.raw.url}`);

      // If we have analytics enabled
      if (this.website.analytics.enabled) this.website.analytics.requests++;

      // If we need to authenicate and get the user session
      if (route.requirements.authenicate) {
        if (!req.session.user) return res.redirect('/login');
      }

      // If we need to allow administrative permissions
      if (route.requirements.admin) {
        if (!req.session.user) return res.redirect('/login');

        // make a shallow copy so we can type it
        // blame fastify-session for not letting
        // me extend this myself ¯\_(ツ)_/¯
        const user: UserModel = req.session.user;
        if (!user.admin) return res.redirect('/');
      }
  
      // Try to run the route
      try {
        await route.run.apply(router, [req, res]);
      } catch (ex) {
        // Oops! We found an error, we better log it.
        this.website.log('fatal', `Unable to process request to "${req.raw.method!.toUpperCase()} ${req.raw.url}"`, ex);
        return res.render('pages/Error', {
          message: ex.message,
          code: 500
        });
      }
    });
  }
}