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

import type { DatabaseConfig, User, Project, Organisation, TypedObject, PermissionNodes } from '../util/models';
import { pipelines, Dialect, Connection } from '@augu/maru';
import { randomBytes } from 'crypto';
import { Stopwatch } from './Stopwatch';
import { Logger } from './Logger';
import { Nodes } from '../util/Constants';
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
  projects?: string[];
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

interface CreateOrganisation {
  description?: string;
  website?: string;
  owner: string;
  name: string;
}

interface UpdateOrganisation {
  description?: string;
  projects?: string;
  project?: string;
  website?: string;
  github?: string;
  name?: string;
}

/**
 * Represents the [Database] class, which executes SQL queries from PostgreSQL and returns the value
 */
export default class Database {
  /** The connection to PostgreSQL */
  public connection?: Connection;

  /** Connection manager */
  private dialect: Dialect;

  /** Logger instance */
  private logger: Logger;

  /** Number of calls (returns -1 if it's not enabled or it's just initialised) */
  public calls: number;

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

    this.logger = new Logger();
    this.calls  = -1;
  }

  /**
   * Getter to check if the database is online
   */
  get online() {
    if (this.connection === undefined) return false;
    return this.connection.connected;
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
      }).catch((error: string | object | any[] | Error) => {
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
      }).catch((error: string | object | any[] | Error) => {
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

    ++this.calls;
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
    ++this.calls;
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

    ++this.calls;
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

    if (data.hasOwnProperty('project') && data.hasOwnProperty('projects')) throw new TypeError('Only accepting "project" or "projects"; can\'t have both');

    if (data.hasOwnProperty('project')) {
      if (!user.projects.includes(data.project!)) {
        const projects = user.projects.concat([data.project!]);
        table.projects = projects;
      }
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

    if (data.hasOwnProperty('projects')) {
      const projects = user.projects.concat(data.projects!);
      table.projects = projects;
    }

    if (data.hasOwnProperty('description') && user.description !== data.description) {
      table.description = data.description;
    }

    if (data.hasOwnProperty('github') && user.github !== data.github) {
      table.github = data.github;
    }

    ++this.calls;
    return this.connection!.query(pipelines.Update({
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

    ++this.calls;
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

      // And now we add the owner
      await this.updateUser(data.owner, { project: project.name });
    }

    if (data.hasOwnProperty('name') && project.name !== data.name) {
      table.name = data.name;
    }

    ++this.calls;
    return this.connection!.query(pipelines.Update<Project>({
      values: table,
      query: ['id', project.id],
      table: 'projects',
      type: 'set'
    }))
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Creates an organisation
   * @param packet The organisation data packet
   */
  async createOrganisation(packet: CreateOrganisation) {
    const id = Snowflake.generate();

    ++this.calls;
    await this.connection!.query(pipelines.Insert<Organisation>({
      values: {
        permissions: {
          [packet.owner]: {
            'remove.member': 'true',
            'manage.org': 'true',
            'delete.org': 'true',
            'add.member': 'true',
            publish: 'true',
            admin: 'true',
            edit: 'true'
          }
        },
        description: packet.description || '',
        created_at: new Date(), // eslint-disable-line camelcase
        projects: [],
        members: [packet.owner],
        website: packet.website || '',
        github: null,
        owner: packet.owner,
        name: packet.name,
        id
      },
      table: 'organisations'
    }));

    return id;
  }

  /**
   * Update an organisation's details
   * @param id The organisation's ID
   * @param data The data to update
   */
  async updateOrganisation(id: string, data: UpdateOrganisation) {
    const org = await this.get('organisations', ['id', id]);
    if (org === null) return;

    const table: TypedObject<string, any> = {};
    if (data.hasOwnProperty('description') && org.description !== data.description) {
      table.description = data.description;
    }

    if (data.hasOwnProperty('projects') && data.hasOwnProperty('project')) throw new TypeError('Cannot accept both "projects" and "project"');
    if (data.hasOwnProperty('project')) {
      if (!org.projects.includes(data.project!)) {
        const projects = org.projects.concat([data.project!]);
        table.projects = projects;
      }
    }

    if (data.hasOwnProperty('projects')) {
      const projects = org.projects.concat(data.projects!);
      table.projects = projects;
    }

    if (data.hasOwnProperty('website')) {
      const Regex = /^https?:\/\/(.*)/;
      if (Regex.test(data.github!)) {
        table.github = data.github;
      } else {
        throw new TypeError('Must be a valid http(s) link');
      }
    }

    if (data.hasOwnProperty('github') && org.github !== data.github) {
      table.github = data.github;
    }

    if (data.hasOwnProperty('name') && org.name !== data.name) {
      table.name = org.name;
    }

    ++this.calls;
    return this.connection!.query(pipelines.Update<Organisation>({
      values: table,
      query: ['id', id],
      table: 'organisations',
      type: 'set'
    }))
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Updates a member's permission in an organisation
   * @param orgID The org's ID
   * @param memberID The member's ID
   * @param node The permission node
   * @param value The value to set
   */
  async updatePermission(orgID: string, memberID: string, node: PermissionNodes, value: 'true' | 'false') {
    if (!Nodes.includes(node)) throw new TypeError(`Permission node "${node}" is not a valid node to set`);
    if (!['true', 'false'].includes(value)) throw new TypeError(`Value for node "${node}" must be a string representation of 'true' or 'false'`);

    const org = await this.get('organisations', ['id', orgID]);
    if (org === null) throw new TypeError(`Organisation "${orgID}" doesn't exist`);
    if (!org.members.includes(memberID)) throw new TypeError(`Member "${memberID}" is not apart of this organisation`);

    const permissions = org.permissions[memberID];
    permissions[node] = value;

    ++this.calls;
    return this.connection!.query(pipelines.Update<Organisation>({
      values: {
        permissions: {
          [memberID]: permissions
        }
      },
      query: ['id', orgID],
      table: 'organisations',
      type: 'set'
    }))
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Adds a member to an organisation
   * @param orgID The organisation's ID
   * @param memberID The member's ID
   */
  async addMemberToOrg(orgID: string, memberID: string) {
    const org = await this.get('organisations', ['id', orgID]);
    if (org === null) throw new TypeError(`Organisation "${orgID}" doesn't exist`);
    if (org.members.includes(memberID)) throw new TypeError(`Member "${memberID}" is already apart of this organisation`);

    // create a "hard-copy" for editing purposes
    const permissions = org.permissions;
    const members = org.members;

    // now we actually "add" them
    permissions[memberID] = {
      'remove.member': 'false',
      'delete.org': 'false',
      'manage.org': 'false',
      'add.member': 'false',
      'publish': 'false',
      'admin': 'false',
      'edit': 'false'
    };
    members.push(memberID);

    ++this.calls;

    // now we actually update the database Uwu
    return this.connection!.query(pipelines.Update<Organisation>({
      values: {
        permissions,
        members
      },
      query: ['id', orgID],
      table: 'organisations',
      type: 'set'
    }))
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Removes a member from the organisation
   * @param orgID The organisation's ID
   * @param memberID The member's ID
   */
  async removeMemberFromOrg(orgID: string, memberID: string) {
    const org = await this.get('organisations', ['id', orgID]);
    if (org === null) throw new TypeError(`Organisation "${orgID}" doesn't exist`);
    if (!org.members.includes(memberID)) throw new TypeError(`Member "${memberID}" is not apart of this organisation`);

    // create a "hard-copy" for editing purposes
    const permissions = org.permissions;
    const members = org.members;

    // now we actually "add" them
    delete permissions[memberID];
    const index = org.members.indexOf(memberID);
    if (index !== -1) org.members.splice(index, 1);

    ++this.calls;

    // now we actually update the database Uwu
    return this.connection!.query(pipelines.Update<Organisation>({
      values: {
        permissions,
        members
      },
      query: ['id', orgID],
      table: 'organisations',
      type: 'set'
    }))
      .then(() => true)
      .catch(() => false);
  }
}
