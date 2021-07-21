/**
 * ☔ Arisu: Translation made with simplicity, yet robust. Made with 💖 using TypeScript and Go.
 * Copyright (C) 2020-2021 Noelware
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

import 'reflect-metadata';

(require('@augu/dotenv') as typeof import('@augu/dotenv')).parse({
    populate: true,
    delimiter: ',',
    file: require('path').join(process.cwd(), '..', '.env'),
    schema: {
        NODE_ENV: {
            type: 'string',
            oneOf: ['development', 'production'],
            default: 'development'
        }
    }
});

import { commitHash, version } from './util/Constants';
import Logger from './singletons/logger';
import app from './container';
import ts from 'typescript';

const log = Logger.getChildLogger({ name: 'Tsubaki: Bootstrap' });
const main = async() => {
    log.info(`Loading Tsubaki v${version} (${commitHash ?? '<unknown>'})`);
    log.info(`-> TypeScript: ${ts.version}`);
    log.info(`->    Node.js: ${process.version}`);
    if (process.env.REGION !== undefined)
        log.info(`->     Region: ${process.env.REGION}`);

    try {
        await app.load();
    } catch(ex) {
        log.fatal('Unable to initialize di container:');
        log.fatal(ex);

        process.exit(1);
    }

    log.info('✔ Tsubaki has launched successfully.');
    process.on('SIGINT', () => {
        log.warn('Received CTRL+C call.');

        app.dispose();
        process.exit(0);
    });
};

main();

process
    .on('unhandledRejection', error => {
        log.error('Received unhandled Promise rejection:');
        log.error(error);

        // if (error instanceof Error) sentry?.report(error);
    }).on('uncaughtException', error => {
        log.fatal('Received uncaught exception:');
        log.error(error);

        // sentry?.report(error);
    });
