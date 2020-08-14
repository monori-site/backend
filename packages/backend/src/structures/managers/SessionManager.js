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

const { createSnowflake } = require('../hash');
const { Signale } = require('signale');

const WEEK = 604800000;

/**
 * Handles all concurrent user sessions, basically a "handler" for it.
 * 
 * All it does, is when you execute route `POST /users/login`,
 * and authenicate successfully, it'll return the user details,
 * JWT token, and a Session object
 * 
 * Note that we are using the Hash Store provided by Redis (allows us to use `hset`, `hdel`, etc),
 * anyway the key of the session is the user's IP address for easy fetching from Redis and the value contains
 * the session data (when it started, the ID of the session, the user's ID, and the user's JWT token)
 * 
 * All sessions expire in around 1 week, all sessions will continue if the API resets itself
 * from exiting the process, so it'll still handle sessions but in a shorter time-frame
 */
module.exports = class SessionManager {
  /**
   * Creates a new [SessionManager] instance
   * @param {import('../Server')} server The server instance
   */
  constructor(server) {
    /**
     * Logger instance
     * @private
     * @type {import('signale').Signale}
     */
    this.logger = new Signale({ scope: 'Sessions' });

    /**
     * The server itself
     * @private
     * @type {import('../Server')}
     */
    this.server = server;

    this.logger.config({ displayBadge: true, displayTimestamp: true });
  }

  /**
   * Gets the session
   * @param {string} ip The user's IP
   * @returns {Promise<Session | null>} The session data or `null` if it's not found
   */
  async get(ip) {
    const data = await this.server.redis.client.hget('sessions', ip);
    if (data === null) return null;

    return JSON.parse(data);
  }

  /**
   * Creates the session
   * @param {string} userID The user's ID
   * @param {string} ip The user's IP
   * @returns {Promise<boolean>} Boolean value if it was created successfully
   */
  async create(userID, ip) {
    const data = await this.get(ip);
    if (data === null) {
      const packet = JSON.stringify({
        startedAt: Date.now(),
        sessionID: createSnowflake(),
        userID,
        ip
      });

      await this.server.redis.client.hset('sessions', ip, packet);
      this.apply(JSON.parse(packet));

      return true;
    } else {
      return false;
    }
  }

  /**
   * Removes a session from Redis
   * @param {string} ip The user's IP
   * @returns {Promise<boolean>} Boolean value if it was successful or not
   */
  async remove(ip) {
    const data = await this.server.redis.client.hget('sessions', ip);
    if (data === null) return false;

    await this.server.redis.client.hdel('sessions', ip);
    return true;
  }

  /**
   * Applies the timer for a new session
   * @param {Session} session The session
   */
  apply(session) {
    this.logger.info(`New session created: ${session.sessionID}`);
    setTimeout(async () => {
      const exists = await this.server.redis.client.hexists('sessions', session.ip);
      if (exists) {
        await this.remove(session.ip);
        this.logger.warn(`Session ${session.sessionID} has expired`);
      }
    }, WEEK);
  }

  /**
   * Checks if there is a session already occuring
   * @param {string} ip The user's IP
   */
  exists(ip) {
    return this.server.redis.client.hexists('sessions', ip);
  }

  /**
   * Re-applies all of the sessions back
   */
  async reapply() {
    this.logger.info('Now re-applying sessions...');
    const all = await this.server.redis.client.hkeys('sessions');
    if (!all.length) {
      this.logger.warn('No sessions were made, continuing...');
      return;
    }

    for (const ip of all) {
      const session = await this.server.redis.client.hget('sessions', ip);
      if (session === null) continue;

      const sess = JSON.parse(session);
      if (!sess.sessionID) continue; // dud session, let's continue

      console.log(sess);

      const timeout = sess.startedAt - (Date.now() + WEEK);
      console.log(timeout);
      if (timeout === 0) continue;

      setTimeout(async () => {
        const exists = await this.server.redis.client.hexists('sessions', sess.ip);
        if (exists) {
          await this.remove(sess.ip);
          this.logger.warn(`Session ${sess.sessionID} has expired`);
        }
      }, sess.startedAt - (Date.now() + WEEK));
    }
  }
};

/**
 * @typedef {object} Session
 * @prop {number} startedAt The time the session has started
 * @prop {string} sessionID The session ID
 * @prop {string} userID The user's ID
 * @prop {string} ip The user's IP address
 */