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

import { Worker, MasterIPC } from '../clustering';
import type { Server } from '..';
import { setupMaster } from 'cluster';
import { Collection } from '@augu/immutable';
import { Logger } from '../Logger';
import Util from '../../util';

export default class ClusteringManager {
  public clusterCount: number;
  public workers: Collection<Worker>;
  public retries: number;
  private server: Server;
  private logger: Logger;
  private ipc: MasterIPC;

  constructor(server: Server) {
    this.clusterCount = server.config.clustering.clusterCount;
    this.workers      = new Collection();
    this.server       = server;
    this.retries      = 0;
    this.logger       = new Logger();
    this.ipc          = new MasterIPC(server);
  }

  /**
   * Starts spawning the workers
   */
  async start(log = false) {
    this.ipc.connect();
    this.clusterCount = Math.floor(this.clusterCount);
    this.logger.info(`Spawning ${this.clusterCount} workers...`);

    const args = this.server.config.analytics.features.includes('gc') ? ['--expose-gc'] : [];
    setupMaster({
      exec: Util.getPath('worker.js'),
      // @ts-ignore
      cwd: process.cwd(),
      execArgv: args
    });

    for (let i = 0; i < this.clusterCount; i++) {
      const worker = new Worker(this.server, i);

      if (log) this.logger.info(`Worker #${i} | Spawning instance...`);
      await worker.spawn()
        .then(() => {
          if (log) this.logger.info(`Worker #${i} | Spawned successfully`);
          this.workers.set(i, worker);
        });
    }

    if (log) this.logger.info('Loaded all workers!');
  }

  /**
   * Restarts all workers
   */
  async restartAll() {
    this.logger.info(`Restarting ${this.workers.size} workers...`);
    for (const worker of this.workers.values()) await worker.respawn();
  }

  /**
   * Restarts a worker
   * @param id The worker
   */
  async restart(id: number) {
    if (this.workers.has(id)) {
      const worker = this.workers.get(id)!;
      if (!worker.healthy) this.logger.warn(`Worker #${worker.id}'s connection is unhealthy, restarting anyway`);

      await worker.respawn();
    } else {
      throw new TypeError(`Worker #${id} doesn't exist`);
    }
  }

  /**
   * Kills all clusters
   */
  kill() {
    for (const cluster of this.workers.values()) cluster.kill();
  }
}
