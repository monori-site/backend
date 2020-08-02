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

import RedisClient, { Redis as IRedis, RedisOptions as RedisConfig } from 'ioredis';
import type { Website } from '../internals/Website';
import { RedisBucket } from '../internals/bucket';
import { Collection } from '@augu/immutable';
import { EventBus } from '../internals/EventBus';

// eslint-disable-next-line
type Events = {
  offline: () => void;
  online: () => void;
};

export default class RedisManager extends EventBus<Events> {
  public connected!: boolean;
  private buckets: Collection<RedisBucket<any>>;
  public client: IRedis;

  constructor() {
    super();

    const options: {
      [x: string]: any
    } = {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    };

    if (process.env.REDIS_PASSWORD !== null) options.password = process.env.REDIS_PASSWORD;

    this.buckets = new Collection();
    this.client = new RedisClient(options);
  }

  async connect() {
    this.client.once('ready', () => {
      this.connected = true;
      this.emit('online');
    });
  }

  disconnect() {
    this.client.disconnect();

    this.connected = false;
    this.emit('offline');
  }

  getBucket<T extends object>(key: string): RedisBucket<T> { // eslint-disable-line
    if (!this.buckets.has(key)) {
      const bucket = new RedisBucket<T>(this.client, key);
      this.buckets.set(key, bucket);

      return bucket;
    } else {
      return this.buckets.get(key)!;
    }
  }
}