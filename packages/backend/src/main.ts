/**
 * Copyright (c) 2020 August
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

import { existsSync, mkdirSync } from 'fs';
import { Signale } from 'signale';
import { Website } from './struct';
import { getPath } from './util';

if (!existsSync(getPath('logs'))) mkdirSync(getPath('logs'));

const logger = new Signale({ scope: 'Master' });
const pkg = require('../package.json');

if (!existsSync(getPath('config.json'))) {
  logger.fatal(`Missing "config.json" file in ${getPath('config.json')}`);
  process.exitCode = 1;
}

logger.info(`Initialising website... (v${pkg.version})`);
const website = new Website(require('./config.json'));
const env = website.config.get<'development' | 'production'>('environment', 'development');

if (env === 'development') logger.warn('Site is in development mode, expect crashes! Report them at https://github.com/auguwu/i18n/issues if you find any.');

website.on('online', async () => {
  logger.info('Website has initialised successfully');
  await website.sessions.reapply();
});

website.on('disposed', () => {
  logger.warn('Website has been disposed successfully');
});

website
  .load()
  .catch(error => {
    logger.fatal('Unable to initialise the website', error);
    process.exitCode = 1;
  });

process
  .on('uncaughtException', (error) => logger.fatal('An uncaught exception has occured', error))
  .on('unhandledRejection', (reason) => logger.fatal('An unhandled promise rejection has occured', reason))
  .on('SIGINT', () => {
    logger.fatal('Closing server...');
    website.dispose();
    process.exit(0);
  });