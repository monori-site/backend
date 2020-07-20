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

import type { Website } from '../internals/Website';
import { pipelines } from '@augu/maru';
import { Signale } from 'signale';

interface DatabaseStats {
  organisations: number;
  projects: number;
  users: number;
}

/**
 * Represents the analytics manager, if it's enabled then it'll calculate:
 * 
 * - Requests per minute, hour, or all-together
 * - Database connectivity & statistics
 * 
 * ...and more!
 */
export default class AnalyticsManager {
  /** Database statistics (gets redone every ~10 minutes) */
  public databaseStats?: DatabaseStats;

  /** Amount of requests done */
  public requests: number;

  /** The logger */
  private logger: Signale;

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
    this.requests = 0;
    this.enabled = website.config.get('analytics', false);
    this.logger = new Signale({ scope: 'Analytics' });
    this.dbCalls = 0;
  }

  /**
   * Collects database statistics
   */
  collect() {
    this.logger.info('Now collecting database statistics...');
    setInterval(async () => {
      const batch = this.website.connection.createBatch();
      batch
        .pipe(pipelines.Count('organisations'))
        .pipe(pipelines.Count('projects'))
        .pipe(pipelines.Count('users'));

      const [orgs, projects, users] = await Promise.all([batch.next<number>(), batch.next<number>(), batch.next<number>()]);

      this.databaseStats = {
        organisations: orgs!,
        projects: projects!,
        users: users!
      };
    }, 600000);
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