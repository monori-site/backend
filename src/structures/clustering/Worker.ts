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

import { fork, Worker as Cluster } from 'cluster';
import { EventEmitter } from 'events';
import type { Server } from '..';
import { Logger } from '../Logger';
import WorkerIPC from './ipc/WorkerIPC';

/**
 * Represents a "worker" or a chunk of code to run on a CPU core.
 * 
 * Useful for huge services to run on more then 1 CPU core and other stuff,
 * read [here](https://nodejs.org/api/cluster.html#cluster_cluster) for more information.
 * 
 * How it works is, it's like we spawn all instances to create a [backend.Server] service
 * and we connect all the pieces together and we have a worker to handle
 * many concurrent requests every second!
 */
export default class Worker extends EventEmitter {
  /** Logger instance for this cluster */
  private logger: Logger;

  /** The worker instance */
  private worker?: Cluster;

  /** If the connection is healthy or not */
  public healthy: boolean;

  /** The IPC instance */
  public ipc: WorkerIPC;

  /** The worker's ID */
  public id: number;

  /**
   * Creates a new [Worker] instance
   * @param server Backend service
   * @param id The worker's ID
   */
  constructor(server: Server, id: number) {
    super();

    this.healthy = false;
    this.logger  = new Logger();
    this.ipc     = new WorkerIPC(server, id);
    this.id      = id;
  }

  /**
   * Kills the worker
   */
  kill() {
    if (this.worker) {
      this.logger.warn('Worker is attached, now killing it...');
      this.worker.removeListener('exit', this.onExit.bind(this));
      this.worker.kill();

      this.worker = undefined;
    } else {
      this.logger.warn('Worker doesn\'t have a cluster worker attached');
    }
  }

  /**
   * Re-spawns a new worker
   */
  async respawn() {
    this.logger.info(`Requested to respawn worker #${this.id}`);

    this.kill();
    await new Promise(resolve => setTimeout(resolve, 5000));
    return this.spawn();
  }

  /**
   * Spawns a new worker
   */
  async spawn() {
    this.logger.info(`Initialising worker #${this.id}...`);
    this.worker = fork({
      CLUSTER_ID: this.id
    });

    this.worker.once('exit', this.onExit.bind(this));
    this.worker.once('online', async() => {
      this.logger.info(`Worker #${this.id} is now online -- connection healthy`);
      this.healthy = true;

      await this.ipc.connect();
    });

    this.worker.on('error', (error) => this.logger.error('Unhandled error has occured', error));
  }

  /**
   * Event handler when the worker has exited
   * @param code The code
   * @param signal The signal (if there was one)
   */
  private async onExit(code: number, signal?: string) {
    this.healthy = false;
    
    this.logger.warn(`Worker #${this.id} has exited with code ${code}${signal ? ` with signal ${signal}` : ''}, re-spawning...`);
    await this.respawn();
  }
}
