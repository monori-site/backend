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

import type { Website } from '../internals';
import { randomBytes } from 'crypto';
import { Signale } from 'signale';

interface Session {
  startedAt: number;
  sessionID: string;
  username: string;
  jwt: string;
  ip: string;
}
export default class SessionManager {
  private logger: Signale;
  constructor(private website: Website) {
    this.logger = new Signale({ scope: 'Sessions' });
  }

  async getSession(ip: string) {
    const data = await this.website.redis.client.get(`sessions:${ip}`);
    if (data === null) return null;

    return JSON.parse<Session>(data);
  }

  async createSession(username: string, jwt: string, ip: string) {
    const data = await this.website.redis.client.get(`sessions:${ip}`);
    if (data === null) {
      const packet = JSON.stringify<Session>({
        startedAt: Date.now(),
        sessionID: randomBytes(2).toString('hex'),
        username,
        jwt,
        ip
      });

      await this.website.redis.client.set(`sessions:${ip}`, packet);
      this.apply(ip, JSON.parse<Session>(packet));
      return true;
    } else {
      return false;
    }
  }

  async removeSession(ip: string) {
    const data = await this.website.redis.client.get(`sessions:${ip}`);
    if (data === null) return false;

    await this.website.redis.client.del(`sessions:${ip}`);
    return true;
  }

  getWeek() {
    // some dumb function to return this dont ask
    return 604800000;
  }

  apply(ip: string, session: Session) {
    this.logger.info(`New session: ${session.sessionID}`);
    setTimeout(async() => {
      const exists = await this.website.redis.client.exists(`sessions:${ip}`);
      if (exists) {
        await this.removeSession(ip);
        this.logger.info(`Session "${session.sessionID}" has expired`);
      }
    }, this.getWeek());
  }

  exists(ip: string) {
    return this.website.redis.client.exists(`sessions:${ip}`);
  }

  async reapply() {
    this.logger.info('Now reapplying sessions...');
    const data = await this.website.redis.client.keys('sessions:*');
    if (!data.length) {
      this.logger.warn('No new sessions were made, not doing anything...');
      return;
    }

    for (const session of data) {
      const value = await this.website.redis.client.get(session);
      if (value === null) continue;

      const sess = JSON.parse<Session>(value);
      if (!sess.sessionID) continue;

      setTimeout(async() => {
        const exists = await this.website.redis.client.exists(session);
        if (exists) {
          await this.removeSession(sess.ip);
          this.logger.info(`Expired session: "${sess.sessionID}" (user: ${sess.username})`);
        }
      }, sess.startedAt - (Date.now() + this.getWeek()));
    }
  }
}