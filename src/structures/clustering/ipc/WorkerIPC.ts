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

import { Client, ClientSocket, NodeMessage } from 'veza';
import type { Server as Monori } from '../..';
import type { IPCRequest, IPCResponse } from '../../../util/models';
import { OPCodes } from '../../../util/Constants';
import { Logger } from '../../Logger';
import Util from '../../../util';

interface WorkerStats {
  heap: string;
  rss: string;
  cpu: { system: string; user: string; }
  id: number;
}

/**
 * Represents an IPC connection with a single worker,
 * we receive & send useful messages like if the IPC is connected,
 * worker statistics, etc.
 */
export default class WorkerIPC {
  private readonly node: Client;
  private service: Monori;
  private socket!: ClientSocket;
  public healthy: boolean;
  private logger: Logger;
  public id: number;

  /**
   * Creates a new [WorkerIPC] instance
   * @param server The backend service
   * @param id The ID of the worker
   */
  constructor(server: Monori, id: number) {
    this.service = server;
    this.healthy = false;
    this.logger  = new Logger();
    this.node    = new Client(`worker.${id}`);
    this.id      = id;

    this._addEvents();
  }

  /**
   * Adds the events to the client node
   */
  private _addEvents() {
    this
      .node
      .on('disconnect', client => {
        this.logger.error(`Disconnected from ${client.name} -- connection unhealthy`);
        this.healthy = false;
      })
      .on('message', message => this.onMessage.apply(this, [message]))
      .on('error', error => this.logger.error('An unexpected error has occured', error))
      .on('ready', (client) => {
        this.logger.info(`Worker IPC #${this.id} | Connected with ${client.name}`);
        this.healthy = true;
      });
  }

  /**
   * Event handler when a message has been received
   * @param message The message
   */
  private async onMessage(message: NodeMessage) {
    const data: IPCRequest<any> = message.data;
    switch (data.op) {
      case OPCodes.Stats: {
        const memory = process.memoryUsage();
        const cpu = process.cpuUsage();
        const data: WorkerStats = {
          heap: Util.formatSize(memory.heapUsed),
          rss: Util.formatSize(memory.rss),
          cpu: { 
            system: `${cpu.system.toFixed(2)}%`, 
            user: `${cpu.user.toFixed(2)}%`
          },
          id: this.id
        };

        return message.reply({ success: true, d: data });
      }

      default:
        this.logger.error(`Invalid OPCode "${data.op}"; skipping...`);
        break;
    }
  }

  /**
   * Returns the connected client socket
   */
  get clientSocket() {
    return this.socket!;
  }

  /**
   * Creates a new connection to the IPC service
   */
  async connect() {
    this.socket = await this.node.connectTo({
      port: this.service.config.clustering.ipcPort,
      host: '127.0.0.1'
    });
  }

  /**
   * Restarts a cluster
   * @param id The cluster's ID
   */
  async restart(id: number) {
    this.logger.warn(`Requesting for cluster #${id} to be restarted...`);
    const message = await this.clientSocket.send({
      op: OPCodes.Restart,
      d: { clusterID: id }
    }) as IPCResponse<any>;

    return message.success;
  }

  /**
   * Restarts all clusters
   */
  async restartAll() {
    this.logger.warn('Requesting for all clusters to be restarted...');
    const message = await this.clientSocket.send({ op: OPCodes.RestartAll }) as IPCResponse<any>;

    return message.success;
  }

  /**
   * Broadcasts to the server
   * @param op The OPCode
   * @param d The data
   */
  async broadcast<T = unknown>(op: OPCodes, d?: T) {
    const res: IPCResponse<T> = await this.clientSocket.send({ op, d }, { receptive: false, timeout: 10000 }) as any;
    if (!res.success) throw new Error(res.d as any);

    return d;
  }
}
