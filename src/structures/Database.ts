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

import type { DatabaseConfig, User, Project, Organisation, TypedObject } from '../util/models';
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

interface CreateProject {
  description?: string;
  owner: string;
  name: string;
}

interface CreateOrganisation {
  description?: string;
  owner: string;
  name: string;
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

interface UpdateProject {
  translations?: {
    [x: string]: string;
  };
  completed?: {
    [x: string]: number;
  };
  description?: string;
  github?: string | null;
  owner?: string;
  name?: string;
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
   * Deletes a Organisation from the database
   * @param id The user's ID
   */
  delete(table: 'organisations', id: string): Promise<boolean>;

  /**
   * Deletes a Project from the database
   * @param id The user's ID
   */
  delete(table: 'projects', id: string): Promise<boolean>;

  /**
   * Deletes a User from the database
   * @param id The user's ID
   */
  delete(table: 'users', id: string): Promise<boolean>;

  /**
   * Deletes an object from the database
   * @param id The ID of the object
   */
  delete(table: 'users' | 'organisations' | 'projects', id: string) {
    return this.connection!.query(pipelines.Delete(table, ['id', id]))
      .then(() => true)
      .catch(() => false);
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

    if (data.hasOwnProperty('project') && !user.projects.includes(data.project!)) {
      const projects = user.projects.concat([data.project!]);
      table.projects = projects;
    }

    if (data.hasOwnProperty('organisation') && !user.organisations.includes(data.organisation!)) {
      const orgs = user.organisations.concat([data.organisation!]);
      table.organisations = orgs;
    }

    if (data.hasOwnProperty('contributor')) {
      if (!['yes', 'no'].includes(data.contributor!)) throw new TypeError('Only accepting "yes" or "no"');
      table.contributor = data.contributor;
    }

    if (data.hasOwnProperty('translator')) {
      if (!['yes', 'no'].includes(data.translator!)) throw new TypeError('Only accepting "yes" or "no"');
      table.translator = data.translator;
    }

    if (data.hasOwnProperty('description') && user.description !== data.description) {
      table.description = data.description;
    }

    if (data.hasOwnProperty('github') && user.github !== data.github) {
      table.github = data.github;
    }

    return this.connection!.query(pipelines.Update({
      returning: Object.keys(table),
      values: table,
      query: ['id', id],
      table: 'users',
      type: 'set'
    }))
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Creates a Project instance
   * @param packet The data packet to insert
   */
  async createProject(packet: CreateProject) {
    const id = Snowflake.generate();
    const [user, org] = await Promise.all([
      this.get('users', ['id', packet.owner]),
      this.get('organisations', ['id', packet.owner])
    ]);

    const type: 'org' | 'user' | null = 
      user === null 
        ? 'org' 
        : org === null 
          ? 'user' 
          : null;

    if (type === null) throw new TypeError(`Snowflake "${packet.owner}" didn't belong to a User or Organisation`);

    await this.connection!.query(pipelines.Insert<Project>({
      values: {
        translations: {},
        description: packet.description || '',
        completed: {},
        github: null,
        owner: packet.owner,
        type,
        name: packet.name,
        id
      },
      table: 'projects'
    }));

    return id;
  }

  /**
   * Update a project's information
   * @param id The project's ID
   * @param data The data packet
   */
  async updateProject(id: string, data: UpdateProject) {
    const project = await this.get('projects', ['id', id]);
    const table: {
      [x: string]: any
    } = {};

    if (project === null) return false;
    if (data.hasOwnProperty('translations')) {
      if (!Object.keys(data.translations!).length) throw new TypeError('Received "translations" packet but nothing found?');

      const translations: TypedObject<string, string> = Object.assign({}, project.translations, data.translations!);
      table['translations'] = translations;
    }

    if (data.hasOwnProperty('completed')) {
      if (!Object.keys(data.completed!).length) throw new TypeError('Received "completed" packet but nothing found?');

      const completed: TypedObject<string, number> = Object.assign({}, project.completed, data.completed!);
      table['completed'] = completed;
    }

    if (data.hasOwnProperty('github') && project.github !== data.github) {
      if (typeof data!.github !== 'string') throw new TypeError('Received "github" packet but isn\'t a string');
      
      let value: string | null = data!.github === '' ? null : data!.github;
      table['github'] = value;
    }

    if (data.hasOwnProperty('owner') && project.owner !== data.owner) {
      if (typeof data!.owner !== 'string') throw new TypeError('Received "owner" packet but isn\'t a string?');
      if (data!.owner === '') throw new TypeError('"owner" in `data` shouldn\'t be empty');

      table['owner'] = data.owner;

      // Now we remove it
      const user = await this.get('users', ['id', project.owner]);
      const index = user!.projects.indexOf(project.id);
      const projects = user!.projects; // keep a hard copy just in case

      if (index !== -1) {
        projects.splice(index, 1);
        await this.updateUser(project.owner, {
          projects
        });
      }
    }
  }
}
