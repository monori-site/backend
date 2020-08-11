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

const { formatSize, toPercent } = require('../../util');
const { pipelines } = require('@augu/maru');
const { userInfo } = require('os');
const constants = require('../../util/Constants');

/**
 * Represents basic analytics of the Backend API,
 * toggable by default using the `ANALYTICS_ENABLED` environment label
 */
module.exports = class AnalyticsManager {
  /**
   * Creates a new [AnalyticsManager] instance
   * @param {import('../Server')} server Server instance
   */
  constructor(server) {
    /**
     * Statistics of the database, can return `undefined` if the instance isn't enabled
     * @type {{ organisations: number; projects: number; users: number; online: boolean } | undefined}
     */
    this.databaseStats = enabled ? {
      organisations: 0,
      projects: 0,
      online: false,
      users: 0
    } : undefined;

    /**
     * The memory usage, can return `undefined` if this instance isn't enabled
     * @type {{ rss: string; heapUsed: string; heapTotal: string; } | undefined}
     */
    this.memoryUsage = enabled ? {
      heapTotal: formatSize(process.memoryUsage().heapTotal),
      heapUsed: formatSize(process.memoryUsage().heapUsed),
      rss: formatSize(process.memoryUsage().rss)
    } : undefined;

    /**
     * The CPU usage, can return `undefined` if this instance isn't enabled
     * @type {{ system: string; user: { name: string; usage: string; } } | undefined}
     */
    this.cpuUsage = enabled ? {
      system: toPercent(process.cpuUsage().system),
      user: {
        usage: toPercent(process.cpuUsage().user),
        name: userInfo().username
      }
    } : undefined;

    /**
     * If the analytics manager is enabled or not
     * @type {boolean}
     */
    this.enabled = server.config.analytics;

    /**
     * How many requests the API has received
     * @type {number}
     */
    this.requests = 0;

    /**
     * The server instance
     * @type {import('../Server')}
     */
    this.server = server;
  }

  /**
   * Creates an interval to calculate cpu usage, memory usage, and database statistics
   */
  createTimer() {
    if (!this.enabled) return;

    /**
     * Interval to collect statistics
     * @type {NodeJS.Timeout}
     */
    this.interval = setInterval(this._collectStats, constants.Analytics);
  }

  /**
   * Stops the timer
   */
  stopTimer() {
    if (!this.enabled) return;

    clearInterval(this.interval);
    this.interval = undefined;
  }

  /**
   * Private function to collect statistics
   * @private
   */
  async _collectStats() {
    if (!this.enabled) return;

    const batch = this.server.database.connection.createBatch()
      .pipe(pipelines.Count('organisations'))
      .pipe(pipelines.Count('projects'))
      .pipe(pipelines.Count('users'));

    const [orgs, projects, users] = await batch.all();
    this.databaseStats = {
      organisations: orgs,
      projects,
      online: this.server.database.connected,
      users,
    };

    this.cpuUsage = {
      system: toPercent(process.cpuUsage().system),
      user: {
        usage: toPercent(process.cpuUsage().user),
        name: userInfo().username
      }
    };

    this.memoryUsage = {
      heapTotal: formatSize(process.memoryUsage().heapTotal),
      heapUsed: formatSize(process.memoryUsage().heapUsed),
      rss: formatSize(process.memoryUsage().rss)
    };
  }
};