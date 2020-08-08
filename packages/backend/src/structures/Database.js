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

const { Dialect, pipelines } = require('@augu/maru');
const { Signale } = require('signale');
const Hash = require('./hash');

/**
 * Represents a [Database], which handles
 * all concurrent database connections with
 * PostgreSQL
 */
module.exports = class Database {
  /**
   * Creates a new [Database] instance
   * @param {import('./Server')} server The server instance
   */
  constructor(server) {
    /**
     * A Maru [Dialect] instance, which handles all of the connections
     * @type {Dialect}
     */
    this.dialect = new Dialect({
      activeConnections: 3,
      ...server.config.database
    });

    /**
     * Represents a [Signale] logger instance for this [Database] instance
     * @private
     * @type {import('signale').Signale}
     */
    this.logger = new Signale({ scope: 'Database' });

    /**
     * The server instance
     * @type {import('./Server')}
     */
    this.server = server;
  }

  /**
   * Getter to check if this [Database] instance is connected
   */
  get connected() {
    return this.connection !== undefined && this.connection.connected;
  }

  /**
   * Spawns a new connection to PostgreSQL
   */
  async connect() {
    if (this.connected) {
      this.logger.warn('There is already a connection already established');
      return;
    }

    this.connection = this.dialect.createConnection();
    await this.connection.connect()
      .catch(this.logger.error);
    
    this.logger.info('Connected to PostgreSQL!');
  }

  /**
   * Disposes this [Database] instance
   * @returns {Promise<void>}
   */
  dispose() {
    if (!this.connected) {
      this.logger.warn('Can\'t dispose this Database instance if it\'s not connected?');
      return;
    }

    return this.dialect.destroy();
  }

  /**
   * Gets a User model or `null` if not found
   * @param {'id' | 'email' | 'username'} type The type to use
   * @param {string} value The value to get
   * @returns {Promise<User | null>}
   */
  getUser(type, value) {
    return this.connection.query(pipelines.Select('users', [type, value]));
  }

  /**
   * Creates a new User model
   * @param {string} username The user's username
   * @param {string} password The user's password
   * @param {string} email The user's email
   */
  createUser(username, password, email) {
    const salt = Hash.createSalt(password, { digest: 'md5' });

    return this.connection.query(pipelines.Insert({
      values: {
        organisations: [],
        description: '',
        contributor: false,
        translator: false,
        projects: [],
        username,
        password,
        admin: false,
        email,
        salt
      },
      table: 'users'
    }));
  }
};

/**
 * @typedef {object} Organisation Represents the organisations model
 * @prop {OrgPermissions} permissions Object of the permissions by member
 * @prop {string[]} projects The list of projects this organisation has made
 * @prop {string[]} members A list of members (by their ID)
 * @prop {string} [github=null] GitHub organisation link
 * @prop {string} owner The owner's ID
 * @prop {string} name The organisation's name
 * @prop {string} id The organisation's ID
 * 
 * @typedef {object} Project Represents a user or organisation's project
 * @prop {Translations} translations Object of the project's translations (key: file name, value: translations itself as a string)
 * @prop {string} [github=null] GitHub repository URL (if needed)
 * @prop {string} owner The owner's ID
 * @prop {'organisation' | 'user'} type The type of project
 * @prop {string} name The project's name
 * @prop {string} id The project's ID
 * 
 * @typedef {object} User Represents a user's account
 * @prop {string[]} organisations How many organisations the user has made
 * @prop {boolean} contributor If they contributed to any project
 * @prop {string} description The user's description
 * @prop {boolean} translator If they made a translation project
 * @prop {string[]} projects How many projects the user has made
 * @prop {string} username The user's username
 * @prop {string} password The raw password
 * @prop {boolean} admin If the user is an adminstrator or not
 * @prop {string} email The user's email address
 * @prop {string} salt The salt to convert the password
 */