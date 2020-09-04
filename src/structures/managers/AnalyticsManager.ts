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

import { Server, Logger } from '..';

interface DatabaseStatistics {
  organisations: number;
  projects: number;
  online: boolean;
  users: number;
}

interface ClusterStatistics {
  [x: number]: {
    computed: string;
    heap: string;
    rss: string;
    cpu: { system: string; user: string; }
    id: number;
  }
}

interface GCStacktrace {
  startedAt: Date;
  duration: string;
  computed: string;
  heap: string;
  rss: string;
}

/**
 * Represents a manager to handle Analytics about the backend service - if enabled.
 */
export default class AnalyticsManager {
  /** Interval to fetch database statistics */
  private _databaseStatsInterval?: NodeJS.Timer;

  /** Interval to fetch cluster statistics */
  private _clusterStatsInterval?: NodeJS.Timer;

  /** Interval to fetch garbage collector statistics */
  private _gcStatsInterval?: NodeJS.Timer;

  /** Database statistics */
  public database: DatabaseStatistics | null;

  /** Cluster statistics */
  public clusters: ClusterStatistics;
  
  /** Number of requests executed */
  public requests: number;

  /** The logger instance */
  private logger: Logger;

  /** The server instance */
  private server: Server;
  
  /** Public garbage collector stacktrace */
  public gc: GCStacktrace[];

  /**
   * Creates a new [AnalyticsManager] instance
   * @param server The server
   */
  constructor(server: Server) {
    this.requests = -1;
    this.database = {
      organisations: 0,
      projects: 0,
      online: false,
      users: 0
    };
    this.clusters = {};
    this.logger   = new Logger('Analytics');
    this.server   = server;
    this.gc       = [];
  }

  /**
   * Resets the statistics
   */
  reset() {
    if (this._databaseStatsInterval) clearInterval(this._databaseStatsInterval);
    if (this._clusterStatsInterval) clearInterval(this._clusterStatsInterval);

    this.database = null;
    this.requests = -1;
    this.clusters = {};
    this.gc       = [];
  }

  /**
   * Starts the manager
   */
  async start() {
    if (!this.server.config.analytics.enabled) {
      this.logger.warn('Analytics is not enabled, continuing...');
      return;
    }

    if (this.server.config.analytics.features.includes('cluster')) {
      this.logger.info('Enabling cluster statistics...');
      this._clusterStatsInterval = setInterval(async() => {
        const data = await this.server.ipc.broadcast(OPCodes.STATS);
        for (const clusterID of Object.keys(data)) this.clusters[clusterID] = data[clusterID];
      }, 120e3);
    }

    if (this.server.config.analytics.features.includes('database')) {
      this.logger.info('Enabling database statistics...');
      this._databaseStatsInterval = setInterval(async() => {
        console.log('lol db stats goes brrr');
      }, 120e3);
    }

    if (this.server.config.analytics.features.includes('gc')) {
      this.logger.info('Enabling garbage collector statistics...');
      this._gcStatsInterval = setInterval(async() => {
        if (!global.gc) {
          this.logger.warn('`global.gc` is not exposed...');
          clearInterval(this._gcStatsInterval!);
          return;
        }

        try {
          require('gc-profiler');
        } catch {
          this.logger.warn('`gc-profiler` is not installed...');
          clearInterval(this._gcStatsInterval!);
          return;
        }

        const profiler: typeof import('gc-profiler') = require('gc-profiler');
        profiler.once('gc', (stats) => {
          this.logger.info('Received garbage collector stats');
          console.log(stats);
        });

        global.gc();
      }, 120e3);
    }

    this.logger.info(`Started the Analytics manager with ${this.server.config.analytics.features.join(', ')} features running concurrently`);
  }
}
