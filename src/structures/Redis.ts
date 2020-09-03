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

  /** Revert function to remove the polyfilled data */
  private _revert!: () => void;

  /** Gets the amount of calls */
  public calls: number;

  /**
   * Creates a new [Redis] instance
   * @param config The Redis configuration
   */
  constructor(config: RedisConfig) {
    this.healthy = false;
    this.logger = new Logger('Redis');
    this.client = new RedisClient({
      lazyConnect: false,
      ...config
    });
    this.calls = -1;
  }

  /**
   * Checks if Redis is online
   */
  get online() {
    // todo: debug this xd
    return this.client.status === 'connected';
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
      this.logger.info('Received READY signal; connection healthy');

      this._revert = this.polyfill();
    });

    this.client.on('wait', () => {
      this.healthy = false;
      this.logger.warn('Received WAIT signal; connection unhealthy');
    });

    this.client.connect()
      .then(() => {
        const time = stopwatch.end();

        this.logger.info(`Connected to Redis in ${time.toFixed(2)}ms`);
      })
      .catch((error) => {
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

    if (this._revert) this._revert();
    this.logger.warn('Disposing Redis instance...');
    this.client.disconnect();
    
    this.healthy = false; // we disposed it, so it's not healthy
  }

  /**
   * Polyfills `this` into the methods we should use
   */
  private polyfill() {
    const _hexists = this.client.hexists;
    const _hget = this.client.hget;
    const _hset = this.client.hset;

    // i do hate my life yes yes
    this.client.hexists = function hexists(this: Redis, key: KeyType, field: string) {
      this.calls++;
      return _hexists(key, field);
    }.bind(this);

    this.client.hget = function hdel(this: Redis, key: KeyType, field: string) {
      this.calls++;
      return _hget(key, field);
    }.bind(this);

    this.client.hset = function hset(this: Redis, key: KeyType, field: string, value: string) {
      this.calls++;
      return _hset(key, field, value);
    }.bind(this);

    return () => {
      this.client.hexists = _hexists;
      this.client.hget    = _hget;
      this.client.hset    = _hset;
    };
  }
}
