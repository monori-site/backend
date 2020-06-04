import { Logger, ConsoleTransport } from '@augu/logging';
import { existsSync } from 'fs';
import { Website } from './core';
import { join } from 'path';

const logger = new Logger('Master', { transports: [new ConsoleTransport()] });

if (!existsSync(join(process.cwd(), 'config.json'))) {
  const path = join(process.cwd(), 'config.json');
  logger.fatal(`Missing "config.json" in ${path}`);
  process.exit(1);
}

const site = new Website(require('./config.json'));
global.website = site; // dont ask why it's global ok?

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