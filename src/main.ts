/**
 * Copyright (c) 2020-2021 Arisu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import 'source-map-support/register';
import 'reflect-metadata';

import * as Constants from './util/Constants';
import showBanner from './util/banner';
import container from './container';
import Logger from './singletons/logger';
import Sentry from '@sentry/node';
import Config from './components/Config';

const installSentry = (config: Config) => {
  const dsn = config.get('sentryDsn');
  if (dsn === undefined)
    return false;

  Sentry.init();
  Sentry.configureScope(scope => scope
    .setTags({
      'project.version': Constants.version,
      'project.commit': Constants.commitHash,
      'project.env': process.env.NODE_ENV ?? 'production'
    })
  );

  return true;
};

const logger = Logger.getChildLogger({ name: 'Bootstrap' });
(async() => {
  showBanner();

  logger.info('bootstrap: initializing...');
  try {
    await container.load();
  } catch(ex) {
    logger.fatal('bootstrap >> unable to load in container', ex);
    process.exit(1);
  }

  logger.info('bootstrap: success, init sentry...');
  const installed = installSentry(container.$ref<any, Config>(Config));

  logger.info(`bootstrap: sentry: ${installed ? 'installed' : 'not installed'}`);

  process.on('SIGINT', () => {
    logger.warn('bootstrap >> called to be exited.');

    container.dispose();
    process.exit(0);
  });
})();

process
  .on('unhandledRejection', error => logger.fatal('promise >> unhandled rejection:', error))
  .on('uncaughtException',  error => logger.fatal('uncaught exception occured:', error));
