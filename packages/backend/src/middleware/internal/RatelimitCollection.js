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

const { Collection } = require('@augu/immutable');

const REQUESTS_PER_MINUTE = 1000;
const TIME_BEFORE_RESET = 60000;

/**
 * Calculates the next reset time
 */
const getResetTime = () => {
  const date = new Date();
  date.setMilliseconds(date.getMilliseconds() + TIME_BEFORE_RESET);

  return date;
};

/**
 * Represents an extended Collection of handling ratelimits for the RatelimitsPlugin
 * @extends {Collection<Collection<{ ratelimited: boolean; resetTime: Date; timeLeft: number; left: number; hits: number; }>>}
 */
module.exports = class RatelimitCollection extends Collection {
  /**
   * Increments the hits
   * @param {string} route The route
   * @param {string} ip The user's IP address
   */
  inc(route, ip) {
    const ratelimits = this.emplace(route, () => new Collection());
    const ratelimit = ratelimits.emplace(ip, () => ({
      ratelimited: false,
      timeLeft: 0,
      left: 1000,
      hits: 0
    }));

    ratelimit.hits++;
    ratelimit.left--;
    ratelimit.timeLeft = Math.max(REQUESTS_PER_MINUTE - ratelimit.hits, 0);
    ratelimit.resetTime = getResetTime();

    if (ratelimit.hits > REQUESTS_PER_MINUTE) ratelimit.ratelimited = true;
    
    ratelimits.set(ip, ratelimit);
    return ratelimit;
  }

  /**
   * Removes the IP from the route's ratelimit collection
   * @param {string} route The route
   * @param {string} ip The user's IP address
   */
  decrement(route, ip) {
    if (!this.has(route)) return;
    
    const ratelimit = this.get(ip);
    if (!ratelimit) return;

    ratelimit.delete(ip);
  }
};