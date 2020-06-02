import { promises as fs, existsSync } from 'fs';
import { Website, Router, getRoutes } from '..';
import { Logger, ConsoleTransport } from '@augu/logging';
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
        this.logger.warn(`Router ${instance.path} doesn't include any routes.`);
        continue;
      }

      instance.addRoutes(all);
      this.set(instance.path, instance);

      this.logger.info(`Injected router ${instance.path} with ${all.length} routes!`);
    }
  }
}