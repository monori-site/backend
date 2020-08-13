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

const SecretTypeReader = require('./readers/SecretTypeReader');
const { existsSync } = require('fs');
const { isNode10 } = require('./util');
const { Signale } = require('signale');
const { Server } = require('./structures');
const { parse } = require('@augu/dotenv');
const { join } = require('path');

const logger = new Signale({ scope: 'Master' });
if (!isNode10()) {
  logger.fatal(`Sorry but version ${process.version} is not an avaliable version to run Monori. Please update your Node.js installation to v10 or higher.`);
  process.exit(1);
}

if (!existsSync(join(__dirname, '..', '.env'))) {
  logger.fatal('Missing .env directory in the root directory.');
  process.exit(1);
}

const config = parse({
  delimiter: ',',
  populate: false,
  file: join(__dirname, '..', '.env'),
  readers: [SecretTypeReader],
  schema: {
    GITHUB_CLIENT_SECRET: {
      type: 'string',
      default: undefined
    },
    GITHUB_CLIENT_ID: {
      type: 'string',
      default: undefined
    },
    GITHUB_CALLBACK_URL: {
      type: 'string',
      default: undefined
    },
    GITHUB_SCOPES: {
      type: 'array',
      default: []
    },
    GITHUB_ENABLED: {
      type: 'boolean',
      default: false
    },
    DATABASE_USERNAME: 'string',
    DATABASE_PASSWORD: 'string',
    REDIS_PASSWORD: {
      type: 'string',
      default: undefined
    },
    ANALYTICS: {
      type: 'boolean',
      default: true
    },
    DATABASE_HOST: 'string',
    DATABASE_PORT: 'int',
    DATABASE_NAME: {
      type: 'string',
      default: 'pressfbot'
    },
    REDIS_HOST: {
      type: 'string',
      default: 'localhost'
    },
    REDIS_PORT: {
      type: 'int',
      default: 6379
    },
    NODE_ENV: {
      type: 'string',
      oneOf: ['development', 'production'],
      default: 'development'
    },
    SECRET: 'secret',
    PORT: {
      type: 'int',
      default: 3939
    }
  }
});

if (config.node_env === 'development') logger.warn('Warning: You are running Monori in development, expect bugs! If you find some, report it to the developers at https://github.com/auguwu/Monori/issues');

const server = new Server(config);
server.start()
  .then(() => logger.info('Monori has successfully booted up!'))
  .catch(error => logger.error('Unable to load up Monori', error));

process.on('uncaughtException', (error) => logger.error('Received an uncaught exception:', error));
process.on('unhandledRejection', (error) => logger.error('Received an unhandled Promise rejection:', error));
process.on('SIGINT', () => {
  logger.warn('Disposing Monori...');
  server.dispose();

  process.exit(0);
});