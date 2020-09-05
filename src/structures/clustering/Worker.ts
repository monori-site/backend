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

import type { ResponsiveMessage, WorkerStatistics } from '../../util/models';
import { fork, Worker as Cluster } from 'cluster';
import { WorkerOPCodes } from '../../util/Constants';
import { EventEmitter } from 'events';
import type { Server } from '..';
import { Collection } from '@augu/immutable';
import { Logger } from '../Logger';

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
  /** Timeout before we halt this worker's process */
  private _readyTimeout?: NodeJS.Timeout;

  /** Collection of all the messages from Worker -> Master */
  private messages: Collection<ResponsiveMessage>;

  /** The worker instance */
  private worker?: Cluster;

  /** Logger instance for this cluster */
  private logger: Logger;

  /** If the connection is healthy or not */
  public healthy: boolean;

  /** The worker's ID */
  public id: number;

  /**
   * Creates a new [Worker] instance
   * @param server Backend service
   * @param id The worker's ID
   */
  constructor(private server: Server, id: number) {
    super();

    this.messages = new Collection();
    this.healthy  = false;
    this.logger   = new Logger();
    this.id       = id;
  }

  /**
   * Getter to check if the worker is online
   */
  get online() {
    if (this.worker === undefined) return false;
    return this.worker.isConnected();
  }

  /**
   * Kills the worker
   */
  kill() {
    if (this.worker) {
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
  spawn() {
    return new Promise((resolve, reject) => {
      this.logger.info(`Initialising worker #${this.id}...`);
      this.worker = fork({
        CLUSTER_ID: this.id,
        NODE_ENV: this.server.config.environment
      });

      this.worker.once('exit', this.onExit.bind(this));
      this.worker.once('online', async() => {
        this.logger.info(`Worker #${this.id} | Worker is now online -- connection healthy`);
        this.healthy = true;
  
        if (this._readyTimeout) clearTimeout(this._readyTimeout);

        resolve();
      });
  
      this.worker.on('error', (error) => this.logger.error(`Worker #${this.id} | Unhandled error has occured`, error));
      this.worker.on('message', this.handleMessage.bind(this));

      this._readyTimeout = setTimeout(() => {
        this.logger.info(`Worker #${this.id} | Process took too long to boot up`);
        this.kill();

        return reject();
      }, this.server.config.clustering.timeout);
    });
  }

  /**
   * Event handler when the worker has exited
   * @param code The code
   * @param signal The signal (if there was one)
   */
  private async onExit(code: number, signal?: string) {
    this.healthy = false;
    
    this.logger.warn(`Worker #${this.id} | Exited with code ${code}${signal ? ` with signal ${signal}` : ''}, re-spawning...`);
    await this.respawn();
  }

  async handleMessage(message: any) {
    let payload!: any;
    try {
      payload = JSON.parse(message);
    } catch(ex) {
      this.logger.error(`Worker #${this.id} | Unable to serialise message`, ex);
    }

    if (!payload.hasOwnProperty('op')) {
      this.logger.error(`Worker #${this.id} | Missing \`op\` in payload`);
      return;
    } else if (!payload.hasOwnProperty('nonce')) {
      this.logger.error(`Worker #${this.id} | Missing \`nonce\` in payload`);
      return;
    }

    const msg = this.messages.get(payload.nonce);
    if (!msg) {
      this.logger.error(`Worker #${this.id} | Nonce "${payload.nonce}" was not found`);
      return;
    }

    // Delete it since we have a hard copy of it above
    this.messages.delete(payload.nonce);
    switch (msg.op) {
      case WorkerOPCodes.RestartAll: {
        try {
          await this.server.clusters.restartAll();
          return msg.resolve();
        } catch(ex) {
          return msg.reject(ex);
        }
      }

      case WorkerOPCodes.Restart: {
        if (!msg.d) return msg.reject(new TypeError('Missing data packet'));
        
        const data: any = msg.d;
        if (typeof data === 'object' && !Array.isArray(data)) {
          if (!data.hasOwnProperty('id')) return msg.reject(new TypeError('Missing `id` in data'));

          const id = data.id;
          try {
            await this.server.clusters.restart(id);
            return msg.resolve();
          } catch(ex) {
            return msg.reject(ex);
          }
        } else {
          return msg.reject(new TypeError(`Expecting an object, but received ${typeof data}`));
        }
      }

      case WorkerOPCodes.Fetch: {
        if (!msg.d) return msg.reject(new TypeError('Missing data packet'));
        
        const data: any = msg.d;
        if (typeof data === 'object' && !Array.isArray(data)) {
          if (!data.hasOwnProperty('id')) return msg.reject(new TypeError('Missing `id` in data'));

          const id = data.id;
          const worker = this.server.clusters.workers.get(id);
          if (!worker) return msg.resolve(null);
          else return msg.resolve(worker);
        } else {
          return msg.reject(new TypeError(`Expecting an object, but received ${typeof data}`));
        }
      }

      case WorkerOPCodes.Stats: {
        if (!msg.d) return msg.reject(new TypeError('Missing "data" packet'));

        const data: any = msg.d;
        if (typeof data === 'object' && !Array.isArray(data)) {
          if (!data.hasOwnProperty('id')) return msg.reject(new TypeError('Missing `id` in data'));

          const id = data.id;
          const worker = this.server.clusters.workers.get(id);
          if (!worker) return msg.resolve(null);
          else return msg.resolve({
            healthy: worker.healthy,
            online: worker.online,
            id: worker.id
          });
        } else {
          return msg.reject(new TypeError(`Expecting an object, but received ${typeof data}`));
        }
      }

      default:
        return msg.reject(new TypeError(`OPCode "${msg.op}" is not avaliable`));
    }
  }
}
