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

import { Website, Config, SecretTypeReader } from './struct';
import { existsSync, mkdirSync } from 'fs';
import { Signale } from 'signale';
import { getPath } from './util';
import { parse } from '@augu/dotenv';
import { join } from 'path';

if (!existsSync(getPath('logs'))) mkdirSync(getPath('logs'));

const logger = new Signale({ scope: 'Master  ' });
const pkg = require('../package.json');

const result = parse<Config>({
  populate: false,
  file: join(__dirname, '..', '.env'),
  readers: [SecretTypeReader],
  delimiter: ',',
  schema: {
    GITHUB_CLIENT_SECRET: {
      default: null,
      type: 'string'
    },
    GITHUB_CALLBACK_URL: {
      default: null,
      type: 'string'
    },
    DATABASE_USERNAME: 'string',
    DATABASE_PASSWORD: 'string',
    GITHUB_CLIENT_ID: {
      default: null,
      type: 'string'
    },
    GITHUB_SCOPES: {
      default: [],
      type: 'array'
    },
    GITHUB_ENABLED: {
      default: false,
      type: 'boolean'
    },
    REDIS_PASSWORD: {
      default: null,
      type: 'string'
    },
    DATABASE_PORT: 'int',
    DATABASE_HOST: 'string',
    DATABASE_NAME: 'string',
    REDIS_HOST: 'string',
    REDIS_PORT: {
      default: 6379,
      type: 'int'
    },
    ANALYTICS: {
      default: false,
      type: 'boolean'
    },
    NODE_ENV: {
      default: 'development',
      oneOf: ['development', 'production'],
      type: 'string'
    },
    SECRET: 'secret',
    PORT: {
      default: 6969,
      type: 'int'
    }
  }
});

logger.info(`Initialising website... (v${pkg.version})`);
const website = new Website(<any> result);

if (process.env.NODE_ENV === 'development') logger.warn('Site is in development mode, expect crashes and/or bugs! Report them at https://github.com/auguwu/monori/issues if you find any crashes and bugs.');

website.on('online', async () => {
  logger.info('Website has initialised successfully');
  await website.sessions.reapply();
});

website
  .load()
  .catch(error => {
    logger.fatal('Unable to initialise the website\n', error);
    process.exit(1);
  });

process
  .on('uncaughtException', (error) => logger.fatal('An uncaught exception has occured', error))
  .on('unhandledRejection', (reason) => logger.fatal('An unhandled promise rejection has occured', reason))
  .on('SIGINT', () => {
    website.dispose();
    process.exit(0);
  });