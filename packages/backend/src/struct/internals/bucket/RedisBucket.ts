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

import type { Redis as RedisClient } from 'ioredis';

/**
 * Manages data structure using Redis as a storage bucket.
 * 
 * @credit [Nino](https://github.com/NinoDiscord/Nino/blob/master/src/util/RedisQueue.ts)
 * @typeparam T: The type when parsing
 */
export class RedisBucket<T = unknown> {
  /**
   * The redis client itself
   */
  private redis: RedisClient;

  /**
   * The key to fetch data from
   */
  private key: string;

  /**
   * Constructs a new instance of the RedisBucket instance
   * @param redis The redis client
   * @param key The key
   */
  constructor(redis: RedisClient, key: string) {
    this.redis = redis;
    this.key = key;
  }

  /**
   * Returns the first element of the queue
   */
  async get() {
    const item = await this.redis.lindex(this.key, 0);
    return JSON.parse<T>(item);
  }

  /**
   * Gets the element and removes it from the queue
   */
  async pop() {
    const item = await this.redis.lpop(this.key);
    return JSON.parse<T>(item);
  }

  /**
   * Pushes a new value to the queue
   * @param data The data to set
   */
  async push(data: T) {
    await this.redis.lpush(JSON.stringify(data));
  }
  
  /**
   * Gets the size of this queue
   */
  size() {
    return this.redis.llen(this.key);
  }
}