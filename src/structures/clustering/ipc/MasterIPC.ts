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

import type { IPCRequest, IPCResponse } from '../../../util/models';
import type { Server as Monori } from '../..';
import { NodeMessage, Server } from 'veza';
import { isMaster } from 'cluster';
import { OPCodes } from '../../../util/Constants';
import { Logger } from '../../Logger';

interface RestartArgs {
  clusterID: number;
}

interface ReadyArgs {
  clusterID: number;
}

/**
 * The master IPC is the controller of all IPC connections, used in the main bot instance (`Server#ipc`)
 * to request cluster information and other sorts
 */
export default class MasterIPC {
  /** The actual TCP server */
  private readonly server: Server;

  /** The Monori instance */
  private service: Monori;

  /** If the IPC service is healthy or not */
  public healthy: boolean;

  /** The logger instance */
  private logger: Logger;

  /**
   * Creates a new [MasterIPC] instance
   * @param server The backend server
   */
  constructor(server: Monori) {
    this.server  = new Server('master');
    this.logger  = new Logger();
    this.healthy = false;
    this.service = server;

    this._addEvents();
  }

  /**
   * Adds additional events from [veza.Server]
   */
  private _addEvents() {
    this
      .server
      .on('disconnect', () => {
        this.logger.error('Disconnected from IPC service -- connection unhealthy to use');
        this.healthy = false;
      })
      .on('connect', () => {
        this.healthy = true;
      })
      .on('message', message => this.onMessage.apply(this, [message]))
      .on('error', error => this.logger.error('Unhandled error has occured', error));
  }

  /**
   * Event handler for receiving messages
   * @param message The message itself
   */
  private onMessage(message: NodeMessage) {
    const data: IPCRequest<any> = message.data;
    if (!data.hasOwnProperty('op')) {
      this.logger.warn('IPC message is missing `op` property, continuing...');
      return;
    }

    switch (data.op) {
      case OPCodes.RestartAll: return this.restartAll(message);
      case OPCodes.Restart:    return this.restart(message);
      case OPCodes.Fetch:      return this.fetch(message);
      default:
        this.logger.warn(`Invalid OPCode "${data.op}"; skipping...`);
        break;
    }
  }

  /**
   * Restarts all clusters
   * @param msg The message
   */
  private async restartAll(msg: NodeMessage) {
    this.logger.warn('Requested to restart all clusters...');

    try {
      await this.service.clusters.restartAll();
      return msg.reply({ success: true });
    } catch(ex) {
      return msg.reply({
        success: false,
        d: {
          message: `[MasterIPC | ${ex.name}] ${ex.message.slice(ex.message.indexOf(ex.name.length + 1))}`,
          stack: ex.hasOwnProperty('stack') ? ex.stack.split('\n') : null
        }
      });
    }
  }

  /**
   * Restarts a cluster by it's ID
   * @param msg The message
   */
  private async restart(msg: NodeMessage) {
    const data: IPCRequest<RestartArgs> = msg.data;
    if (!data.hasOwnProperty('d')) return msg.reply({
      success: false,
      d: {
        message: '[MasterIPC | MissingDataException] No data was passed, so nothing was done.',
        stack: null
      }
    });

    if (!data.d!.hasOwnProperty('clusterID')) return msg.reply({
      success: false,
      d: {
        message: '[MasterIPC | MissingClusterException] Missing `clusterID` in message data',
        stack: null
      }
    });

    if (!this.service.clusters.workers.has(data.d!.clusterID)) return msg.reply({
      success: false,
      d: {
        message: `[MasterIPC | UnknownClusterException] Cluster #${data.d!.clusterID} was not found`,
        stack: null
      }
    });

    try {
      await this.service.clusters.restart(data.d!.clusterID);
      return msg.reply({ success: true });
    } catch(ex) {
      return msg.reply({
        success: false,
        d: {
          message: `[MasterIPC | ${ex.name}] ${ex.message.slice(ex.message.indexOf(ex.name + 1))}`,
          stack: ex.hasOwnProperty('stack') ? ex.stack : null
        }
      });
    }
  }

  /**
   * Fetches a list of workers
   * @param msg The message
   */
  fetch(msg: NodeMessage) {
    return msg.reply({
      success: true,
      d: this.service.clusters.workers.map(worker => ({
        healthy: worker.healthy,
        online: worker.online,
        id: worker.id
      }))
    });
  }

  /**
   * Broadcasts data to any additional workers
   * @param request The request
   * @template T The data return packet
   */
  async broadcast<T = unknown>(request: IPCRequest<T>): Promise<T[]> {
    const data: IPCResponse<T>[] = await this.server.broadcast(request, {
      receptive: true,
      timeout: 10000
    });

    const errors = data.filter(res => !res.success);
    if (errors.length) {
      const error = errors[0];
      throw new TypeError((<any> error.d!).message);
    } else {
      return data.map(res => res.d!);
    }
  }

  /**
   * Connects the service
   */
  connect() {
    this.logger.info(`Now connecting to the server with port ${this.service.config.clustering.ipcPort}...`);
    this.server.listen({ port: this.service.config.clustering.ipcPort, host: '127.0.0.1' })
      .then((client) => this.logger.info(`Connected as ${client.name} on port ${this.service.config.clustering.ipcPort}`))
      .catch((error) => this.logger.error('Unable to create a new IPC service', error));
  }
}
