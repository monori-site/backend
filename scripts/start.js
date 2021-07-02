#!/usr/bin/env node

/**
 * ☔ Arisu: Translation made with simplicity, yet robust. Made with 💖 using TypeScript, React, and Next.js
 * Copyright (c) 2019-2021 Arisu Team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { hostname, networkInterfaces } = require('os');
const { LoggerWithoutCallSite } = require('tslog');
const { readFileSync } = require('fs');
const { createServer } = require('http');
const { execSync } = require('child_process');
const { version } = require('../package.json');
const { parse } = require('url');
const { join } = require('path');
const next = require('next');

const logger = new LoggerWithoutCallSite({
  displayFunctionName: true,
  exposeErrorCodeFrame: true,
  displayInstanceName: true,
  displayFilePath: 'hideNodeModulesOnly',
  dateTimePattern: '[ day-month-year / hour:minute:second ]',
  displayTypes: false,
  instanceName: hostname(),
  name: 'Arisu'
});

const argv = process.argv.slice(2);
const isDev = argv.length > 0 && (argv.find(flag => flag === '-D') || argv.slice()) ?? true;
const _host = argv.length > 0 && (argv.find(flag => flag.startsWith('--host')) || argv.find(flag => flag.startsWith('-h'))) ?? null;
const path = join(process.cwd(), 'assets', 'banner.txt');
const contents = readFileSync(path, { encoding: 'utf-8' });
const host = _host === null ? null : _host.split('=')?.[1] ?? null;

console.log(contents
  .replace('$VERSION$', version)
  .replace('$COMMIT$', execSync('git rev-parse HEAD').toString().trim().slice(0, 8) ?? '... not from git ...')
  .replaceAll('$RESET$', '\x1b[0m')
  .replaceAll('$GREEN$', '\x1b[32m')
  .replaceAll('$MAGENTA$', '\x1b[95m')
  .replaceAll('$CYAN$', '\x1b[36m'));

function findAvailableHost() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const { address, family, internal } of interfaces[name]) {
      if (family === 'IPv4' && !internal) return address;
    }
  }

  return null;
}

(async() => {
  const app = next({
    quiet: isDev,
    conf: {
      productionBrowserSourceMaps: true,
      poweredByHeader: false,
      trailingSlash: true,
      future: {
        webpack5: true
      },
      images: {
        domains: ['cdn.floofy.dev']
      }
    },
    dir: join(process.cwd(), 'src'),
    dev: isDev
  });

  logger.info(`Preparing Next.js...${isDev ? '\nYou will receive Next logs below this' : ''}`);
  try {
    await app.prepare();
  } catch(ex) {
    logger.fatal('unable to initialize next app:', ex);
    process.exit(1);
  }

  logger.info('Next app has been prepared, now booting up server...');
  const handler = app.getRequestHandler();
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handler(req, res, parsedUrl);
  });

  server.once('listening', () => {
    const address = server.address();
    const isUnixSock = typeof address === 'string';
    const networks = [];

    if (isUnixSock)
      networks.push(`unix:///${address}`);
    else if (address !== null)
      networks.push(address.address === '::' ? 'http://localhost:17013' : `http://${address.address}:17013`);

    const network = findAvailableHost();
    if (network !== null)
      network.push(`http://${network}:17013`);

    logger.info([
      '✔ Arisu is now running under these available hosts:',
      networks.join('\n'),
      '',
      '🤔 Report bugs on the GitHub repository: https://github.com/arisuland/Arisu',
      '🥀 Once you hit CTRL+C, I will stop this process. Best recommended',
      'to use PM2 or Docker if you want Arisu running in the background.',
      '',
      '👉 https://docs.arisu.land/getting-started/background-process'
    ].join('\n'));
  });

  server.on('error', error => logger.error('arisu: http error:', error));
  server.listen(17013, host);
})();

process
  .on('unhandledRejection', error => logger.fatal('arisu: unhandled promise:', error))
  .on('uncaughtException',  error => logger.fatal('arisu: uncaught exception:', error));
