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

import type { DatabaseConfig, User, Project, Organisation } from '../util/models';
import { pipelines, Dialect, Connection } from '@augu/maru';
import { randomBytes } from 'crypto';
import { Stopwatch } from './Stopwatch';
import { Logger } from './Logger';
import Snowflake from '../util/Snowflake';
import argon2 from 'argon2';

interface UserPacket {
  username: string;
  password: string;
  email: string;
}

interface UpdateUser {
  organisation?: string;
  description?: string;
  contributor?: 'yes' | 'no';
  translator?: 'yes' | 'no';
  username?: string;
  password?: string;
  project?: string;
  github?: string;
  email?: string;
}

/**
 * Represents the [Database] class, which executes SQL queries from PostgreSQL and returns the value
 */
export class Database {
  /** The connection to PostgreSQL */
  public connection?: Connection;

  /** Connection manager */
  private dialect: Dialect;

  /** Logger instance */
  private logger: Logger;

  /**
   * Creates a new [Database] instance
   * @param config The configuration
   */
  constructor(config: DatabaseConfig) {
    this.dialect = new Dialect({
      activeConnections: config.activeConnections,
      password: config.password,
      username: config.username,
      database: config.name,
      host: config.host,
      port: config.port
    });

    this.logger = new Logger('Database');
  }

  /**
   * Getter to check if the database is online
   */
  get online() {
    if (this.connection === undefined) return false;
    else return this.connection.connected; 
  }

  /**
   * Connects to the database
   */
  connect() {
    if (this.online) {
      this.logger.warn('Connection already exists, ignoring...');
      return;
    }

    this.logger.info('Connecting to PostgreSQL...');
    const stopwatch = new Stopwatch();
    const connection = this.dialect.createConnection();

    stopwatch.start();
    connection
      .connect()
      .then(() => {
        const time = stopwatch.end();

        this.logger.info(`Connected to PostgreSQL! (~${time.toFixed(2)}ms)`);
        this.connection = connection;
      }).catch((error) => {
        const time = stopwatch.end();

        this.logger.error(`Unable to connect to PostgreSQL (~${time.toFixed(2)}ms)`, error);
        process.emit('SIGINT' as any);
      });
  }

  /**
   * Disconnects from PostgreSQL
   */
  disconnect() {
    if (!this.online) {
      this.logger.warn('Connection is non-existent; continuing...');
      return;
    }

    const stopwatch = new Stopwatch();
    this.connection = undefined;

    this.dialect.destroy()
      .then(() => {
        const time = stopwatch.end();
        this.logger.info(`Disconnected connection in ${time.toFixed(2)}ms`);
      }).catch(error => {
        const time = stopwatch.end();
        this.logger.error(`Unable to disconnect; connection might bleed (~${time.toFixed(2)}ms)`, error);
      });
  }

  /**
   * Gets a Organisation from the database
   * @param column The column
   */
  get(table: 'organisations', column: [string, any]): Promise<Organisation | null>;

  /**
   * Gets a Project from the database
   * @param column The column
   */
  get(table: 'projects', column: [string, any]): Promise<Project | null>;

  /**
   * Gets an User from the database
   * @param column The column
   */
  get(table: 'users', column: [string, any]): Promise<User | null>;

  /**
   * Gets an object from the database
   * @param table The table
   * @param column The column
   */
  get<T>(table: 'users' | 'organisations' | 'projects', column: [string, any]): Promise<T | null> {
    if (column.length < 1) throw new SyntaxError('Column must be an Array of [key, value]');
    if (!this.online) throw new SyntaxError('We didn\'t establish a connection yet');

    return this.connection!.query<T>(pipelines.Select(table, column));
  }

  /**
   * Creates a User
   * @param packet The user packet
   * @returns The user's snowflake
   */
  async createUser(packet: UserPacket) {
    const password = await argon2.hash(packet.password);
    const salt = randomBytes(16).toString('hex');
    const id = Snowflake.generate();

    await this.connection!.query(pipelines.Insert<User>({
      values: {
        organisations: [],
        description: '',
        contributor: false,
        translator: false,
        created_at: new Date(), // eslint-disable-line camelcase
        projects: [],
        username: packet.username,
        password,
        avatar: '',
        admin: false,
        email: packet.email,
        salt,
        id
      },
      table: 'users'
    }));

    return id;
  }

  /**
   * Update a user's content in the database
   * @param id The user's ID
   * @param data The packet
   */
  async updateUser(id: string, data: UpdateUser) {
    const user = await this.get('users', ['id', id]);
    const table: { [x: string]: any } = {};

    if (user === null) return false;
    if (data.hasOwnProperty('username') && user.username !== data.username) {
      const u = await this.get('users', ['username', data.username]);
      if (u === null) {
        table.username = data.username;
      } else {
        throw new TypeError(`Username "${data.username}" is already taken`);
      }
    }
    
    if (data.hasOwnProperty('email') && user.email !== data.email) {
      const u = await this.get('users', ['email', data.email]);
      if (u === null) {
        table.email = data.email;
      } else {
        throw new TypeError(`Email "${data.email}" is already taken`);
      }
    }
  }
}
