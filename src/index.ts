import { Logger, ConsoleTransport } from '@augu/logging';
import { existsSync, mkdirSync } from 'fs';
import { Website } from './core';
import { join } from 'path';

if (!existsSync(join(process.cwd(), 'logs'))) mkdirSync(join(process.cwd(), 'logs'));

const logger = new Logger('Master', { transports: [new ConsoleTransport()] });
const pkg = require('../package.json');

if (!existsSync(join(process.cwd(), 'config.json'))) {
  const path = join(process.cwd(), 'config.json');
  logger.fatal(`Missing "config.json" in ${path}`);
  process.exit(1);
}

logger.info(`Initialising website... (v${pkg.version})`);

const config = require('./config.json');
const site = new Website(config);
global.website = site; // this seems like bad practice but dont ask questions ok?

if (config.environment === 'development') logger.warn('Site is in development mode, expect crashes! Report them at https://github.com/auguwu/i18n/issues if you find any.');

site
  .serve()
  .then(() => logger.info('Website has successfully initialised'))
  .catch(error => {
    logger.fatal('Unable to initialise the website', error);
    process.exit(1);
  });

process
  .on('uncaughtException', (error) => logger.fatal('An uncaught exception has occured', error))
  .on('unhandledRejection', (reason) => logger.fatal('An unhandled promise rejection has occured', reason))
  .on('SIGINT', () => {
    logger.fatal('Closing server...');
    site.dispose();
    process.exit(0);
  });