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

import type { Server } from '..';
import { Collection } from '@augu/immutable';
import { Logger } from '../Logger';
import Snowflake from '../../util/Snowflake';

const WEEK = 604800000;

interface Session {
  sessionID: string;
  expiresAt: number;
  startedAt: number;
  user: string;
  ip: string;
}

/**
 * Handles all concurrent user sessions, basically a "handler" for it.
 * 
 * All it does, is when you execute route `POST /users/login`,
 * and authenicate successfully, it'll return the user details and a Session object
 * 
 * Note that we are using the Hash Store provided by Redis (allows us to use `hset`, `hdel`, etc),
 * anyway the key of the session is the user's IP address for easy fetching from Redis and the value contains
 * the session data (when it started, the ID of the session, the user's ID, and the expire details)
 * 
 * All sessions expire in around 1 week, all sessions will continue if the API resets itself
 * from exiting the process, so it'll still handle sessions but in a shorter time-frame
 */
export default class SessionManager {
  private timeouts: Collection<NodeJS.Timeout>;
  private logger: Logger;
  private server: Server;

  constructor(server: Server) {
    this.timeouts = new Collection();
    this.logger   = new Logger('Sessions');
    this.server   = server;
  }

  async get(ip: string) {
    const data = await this.server.redis.hget('sessions', ip);
    if (data === null) return null;

    return JSON.parse<Session>(data);
  }

  async create(user: string, ip: string) {
    const data = await this.get(ip);
    if (data === null) {
      const packet = JSON.stringify({
        sessionID: Snowflake.generate(),
        startedAt: Date.now(),
        expiresAt: Date.now() + WEEK,
        user,
        ip
      });

      await this.server.redis.hset('sessions', ip, packet);
      this.apply(JSON.parse<Session>(packet));

      return true;
    } else {
      return false;
    }
  }

  async remove(ip: string) {
    const data = await this.server.redis.hget('sessions', ip);
    if (data === null) return false;

    await this.server.redis.hdel('sessions', ip);
    return true;
  }

  apply(session: Session) {
    this.logger.info(`New session created: ${session.sessionID}`);
    this.createTimeout(session, WEEK);
  }

  async reapply() {
    const sessions = await this.server.redis.hkeys('sessions');
    if (!sessions.length) {
      this.logger.warn('Now sessions were made, continuing...');
      return;
    }

    for (let i = 0; i < sessions.length; i++) {
      const ip = sessions[i];
      const session = await this.server.redis.hget('sessions', ip);
      if (session === null) continue;

      const sess = JSON.parse<Session>(session);
      if (!sess.sessionID) continue;

      const timeout = Math.abs(sess.startedAt - sess.expiresAt);
      if (timeout < 1) continue;

      this.createTimeout(sess, timeout);
    }
  }

  private createTimeout(session: Session, amount: number) {
    const timeout = setTimeout(() => {
      this.server.redis.hexists('sessions', session.ip)
        .then((exists: number) => {
          if (exists && this.timeouts.has(`timeout:${session.ip}`)) {
            this.logger.info(`Session for ${session.ip} exists! Now clearing...`);
            this.server.redis.hdel('sessions', session.ip)
              .then(() => this.logger.info(`Cleared session ${session.sessionID}`))
              .catch(this.logger.error)
              .finally(async() => {
                this.logger.info('Cleared everything! Time to not bleed this timeout...');
                const timeout = this.timeouts.get(`timeout:${session.ip}`)!;
                clearTimeout(timeout);
              });
          } else {
            this.logger.warn('Session doesn\'t exist; timeout is bleeding');
            clearTimeout(timeout);
          }
        });
    }, amount);

    this.timeouts.set(`timeout:${session.ip}`, timeout);
  }
}
