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

import RedisClient, { Redis as IRedis, KeyType } from 'ioredis';
import type { RedisConfig } from '../util/models';
import { Stopwatch } from './Stopwatch';
import { Logger } from './Logger';

export default class Redis {
  /** If the connection is healthy or not */
  public healthy: boolean;

  /** The client instance */
  private client: IRedis;

  /** Logger */
  private logger: Logger;

  /** Gets the amount of calls */
  public calls: number;

  /**
   * Creates a new [Redis] instance
   * @param config The Redis configuration
   */
  constructor(config: RedisConfig) {
    this.healthy = false;
    this.logger = new Logger();
    this.client = new RedisClient({
      lazyConnect: true,
      ...config
    });
    this.calls = -1;
  }

  /**
   * Checks if Redis is online
   */
  get online() {
    return this.client.status === 'ready';
  }

  /**
   * Connects to Redis
   */
  async connect() {
    if (this.online) {
      this.logger.warn('Redis connection already exists, continuing...');
      return;
    }

    const stopwatch = new Stopwatch();
    this.logger.info('Connecting to Redis...');
    stopwatch.start();

    this.client.once('ready', () => {
      this.healthy = true;
      this.logger.info('Received READY signal from Redis; connection healthy');
    });

    this.client.on('wait', () => {
      this.healthy = false;
      this.logger.warn('Received WAIT signal; connection unhealthy');
    });

    this.client.connect()
      .then(() => {
        const time = stopwatch.end();
        this.logger.info(`Connected to Redis! (~${time.toFixed(2)}ms)`);
      })
      .catch((error: string | object | any[] | Error) => {
        const time = stopwatch.end();
        this.logger.error(`Unable to connect to Redis (~${time.toFixed(2)}ms)`, error);
      });
  }

  /**
   * Disconnects from Redis
   */
  disconnect() {
    if (!this.online) {
      this.logger.warn('No connection exists, continuing...');
      return;
    }

    this.logger.warn('Disposing Redis instance...');
    this.client.disconnect();

    this.healthy = false; // we disposed it, so it's not healthy
  }

  hget(key: KeyType, field: string) {
    ++this.calls;
    return this.client.hget(key, field);
  }

  hset(key: KeyType, field: string, value: string) {
    ++this.calls;
    return this.client.hset(key, field, value);
  }

  hdel(key: KeyType, ...args: any[]) {
    ++this.calls;
    return this.client.hdel(key, ...args);
  }

  hexists(key: KeyType, field: string) {
    ++this.calls;
    return this.client.hexists(key, field);
  }

  hkeys(key: string) {
    ++this.calls;
    return this.client.hkeys(key);
  }
}
