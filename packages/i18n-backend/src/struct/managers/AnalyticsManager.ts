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

import { Logger, createLogger } from '@augu/logging';
import type { Website } from '../internals/Website';

interface ClusterStats {
  [x: number]: {
    memory: NodeJS.MemoryUsage;
    dead: boolean;
    cpu: NodeJS.CpuUsage;
    id: number;
  }
}

interface DatabaseStats {
  organisations: number;
  projects: number;
  online: boolean;
  users: number;
}

/**
 * Represents the analytics manager, if it's enabled then it'll calculate:
 * 
 * - Requests per minute, hour, or all-together
 * - Cluster statistics
 * - Database connectivity & statistics
 * 
 * ...and more!
 */
export default class AnalyticsManager {
  /** Database statistics (gets redone every ~10 minutes) */
  public databaseStats?: DatabaseStats;

  /** Cluster statistics (gets redone every ~10 minutes) */
  public clusterStats?: ClusterStats;

  /** The intervals */
  private intervals: { [x in 'cluster' | 'database']: NodeJS.Timer | null };

  /** Amount of requests done */
  public requests: number;

  /** The logger */
  private logger: Logger;

  /** If the analytics manager is enabled */
  public enabled: boolean;

  /** Amount of DB calls */
  public dbCalls: number;

  /**
   * Creates a new Analytics manager
   * @param website The website
   */
  constructor(private website: Website) {
    this.databaseStats = undefined;
    this.clusterStats = undefined;
    this.intervals = {
      database: null,
      cluster: null
    };
    this.requests = 0;
    this.enabled = website.config.get('analytics', false);
    this.logger = createLogger('Analytics');
    this.dbCalls = 0;
  }

  /**
   * Collects cluster and database statistics
   */
  collect() {
    this.logger.info('Now collecting database and cluster statistics...');
    this.intervals.cluster = setInterval(() => {
      this.website.ipc.send('collectStats', (data) => {
        this.clusterStats = data;
      });
    }, 600000);

    this.intervals.database = setInterval(async () => {
      this.databaseStats = {
        organisations: await this.website.database.count('organisations'),
        projects: await this.website.database.count('projects'),
        online: this.website.database.connected,
        users: await this.website.database.count('users')
      };
    }, 600000);
  }

  /**
   * Disposes the statistics
   */
  dispose() {
    this.logger.info('Disposing intervals...');
    for (const [, interval] of Object.entries(this.intervals)) clearInterval(interval!);
  }

  /**
   * Increments 
   * @param type 
   */
  inc(type: 'request' | 'dbCalls') {
    if (!this.enabled) return;

    switch (type) {
      case 'request': {
        this.requests++;
      } break;

      case 'dbCalls': {
        this.dbCalls++;
      } break;

      default: break;
    }
  }
}