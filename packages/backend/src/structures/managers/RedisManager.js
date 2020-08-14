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

const { Signale } = require('signale');
const RedisClient = require('ioredis');

/**
 * Handles all concurrent sessions with Redis
 */
module.exports = class RedisManager {
  /**
   * Creates a new [RedisManager] instance
   * @param {import('../Server')} server The server instance
   */
  constructor(server) {
    /**
     * If we are connected to Redis
     * @type {boolean}
     */
    this.connected = false;

    /**
     * Logger instance owO
     * @type {import('signale').Signale}
     */
    this.logger = new Signale({ scope: 'Redis' });

    /**
     * Represents the Redis instance itself
     */
    this.client = new RedisClient({
      lazyConnect: true,
      ...server.config.redis
    });

    this.logger.config({ displayBadge: true, displayTimestamp: true });
  }

  /**
   * Connects to Redis
   */
  async connect() {
    try {
      await this.client.connect();
    } catch(ex) {
      this.logger.error(ex);
      return;
    }
    
    this.client.once('ready', () => {
      this.connected = true;
      this.logger.info('Connected to Redis');
    });
  }

  /**
   * Disposes this [RedisManager] instance
   */
  dispose() {
    this.client.disconnect();
    this.connected = false;
  }
};