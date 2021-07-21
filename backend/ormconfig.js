/**
 * ☔ Arisu -- Translation made with simplicity, yet robust.
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

const { parse } = require('@augu/dotenv');
const { join } = require('path');

const config = parse({
  populate: false,
  file: join(__dirname, '.env'),

  schema: {
    DATABASE_USERNAME: 'string',
    DATABASE_PASSWORD: 'string',
    DATABASE_NAME: 'string',
    DATABASE_HOST: 'string',
    DATABASE_PORT: 'int',
    NODE_ENV: {
      type: 'string',
      default: ['development', 'production']
    }
  }
});

module.exports = {
  migrations: ['./build/migrations/*.js'],
  username: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  entities: ['./build/entities/*.js'],
  database: config.DATABASE_NAME,
  logging: false, // enable this when the deprecated message is gone
  type: 'postgres',
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,

  cli: {
    migrationsDir: 'src/migrations'
  }
};
