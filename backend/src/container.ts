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

import { Container } from '@augu/lilith';
import { join } from 'path';
import Logger from './singletons/logger';
import http from './singletons/http';

const log = Logger.getChildLogger({ name: 'Tsubaki: Lilith' });
const container = new Container({
    componentsDir: join(process.cwd(), 'components'),
    servicesDir: join(process.cwd(), 'services'),
    singletons: [
        http
    ]
});

container.on('debug', message => log.debug(message));
export = container;
