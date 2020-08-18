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

const RatelimitCollection = require('./internal/RatelimitCollection');
const { Middleware } = require('../structures');

/**
 * Custom Express middleware to handle ratelimits
 */
module.exports = class RatelimitMiddleware extends Middleware {
  constructor() {
    super('ratelimit', true);

    /**
     * The collection of holding the ratelimits
     */
    this.ratelimits = new RatelimitCollection();
  }

  /**
   * Inject this plugin to Fastify
   * @param {import('express').Request} req The request
   * @param {import('express').Response} res The response
   * @param {import('express').NextFunction} next The next function
   */
  async run(req, res, next) {
    const ratelimit = this.ratelimits.inc(req.url, req.connection.remoteAddress);

    // Check if the headers weren't sent, so we can add our own!
    if (!res.headersSent) {
      res.setHeader('X-Ratelimit-Remaining', ratelimit.timeLeft);
      res.setHeader('X-Ratelimit-Limit', ratelimit.left);
      res.setHeader('X-Ratelimit-Reset', Math.ceil(ratelimit.resetTime.getTime() / 1000));
      res.setHeader('X-Ratelimit-Date', new Date().toGMTString());
    }

    res
      // Remove the IP address from the ratelimit if the response has failed or not
      .on('finish', () => this.ratelimits.decrement(req.url, req.connection.remoteAddress))
      .on('close', () => {
        // If the response wasn't finished, let's decrement it
        if (!res.writableEnded) this.ratelimits.decrement(req.url, req.connection.remoteAddress);
      })
      .on('error', () => this.ratelimits.decrement(req.url, req.connection.remoteAddress));

    if (ratelimit.ratelimited) {
      if (!res.headersSent) res.setHeader('X-Ratelimit-Retry-After', Math.ceil(60000));

      setTimeout(() => this.ratelimits.delete(req.connection.remoteAddress), 60000);
      return res.status(429).send({
        statusCode: 429,
        message: 'Uh oh! Being ratelimited sucks huh?',
        resetAt: (Date.now() - 60000)
      });
    }

    next();
  }
};