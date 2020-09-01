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
import { Stopwatch } from './Stopwatch';
import { Logger } from './Logger';

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
}
