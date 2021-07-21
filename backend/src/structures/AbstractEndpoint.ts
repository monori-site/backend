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

import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Represents a router towards the Fastify server.
 */
export abstract class AbstractEndpoint {
    constructor(public path: string) {}

    abstract execute(req: FastifyRequest, reply: FastifyReply): void;
}
