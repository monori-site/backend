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

import { promises as fs, existsSync } from 'fs';
import { Logger, createLogger } from '@augu/logging';
import type { Website } from '../internals/Website';
import { Collection } from '@augu/immutable';
import { getPath } from '../../util';
import { join } from 'path';
import { Job } from '../internals';

export default class CronJobManager extends Collection<Job> {
  private website: Website;
  private logger: Logger;
  public path: string;

  constructor(website: Website) {
    super();

    this.website = website;
    this.logger = createLogger('CronJobManager');
    this.path = getPath('jobs');
  }

  async load() {
    this.logger.info('Loading routes...');

    const stats = await fs.lstat(this.path);
    if (!existsSync(this.path)) {
      this.logger.error(`Path "${this.path}" doesn't exist, did you remove it by accident?`);
      process.exitCode = 1;
    }

    if (!stats.isDirectory()) {
      this.logger.error(`Path "${this.path}" was not a directory, did you modify the backend on accident?`);
      process.exitCode = 1;
    }

    const jobs = await fs.readdir(this.path);
    if (!jobs.length) {
      this.logger.error(`Path "${this.path}" didn't include any cron jobs`);
      process.exitCode = 1;
    }

    this.logger.info(`Found ${jobs.length} jobs!`);
    for (const job of jobs) {
      const { default: file } = await import(join(this.path, job));
      const cronJob: Job = new file();

      if (!(cronJob instanceof Job)) {
        this.logger.warn(`File "${job.split('.').shift()}" is not a valid cron job (must extend "Job")`);
        continue;
      }

      cronJob.init(this.website);
      this.set(cronJob.name, cronJob);

      this.logger.info(`Added cron job "${cronJob.name}"`);
    }
  }
}