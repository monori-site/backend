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
const { Plugin } = require('../structures');

/**
 * Custom Fastify plugin to apply ratelimits
 */
module.exports = class RatelimitPlugin extends Plugin {
  /**
   * Creates a new [RatelimitPlugin] instance
   */
  constructor() {
    super('ratelimit');

    /**
     * The collection of holding the ratelimits
     */
    this.ratelimits = new RatelimitCollection();
  }

  /**
   * Inject this plugin to Fastify
   * @param {import('fastify').FastifyInstance} server The server
   * @param {any} opts Any options to use
   * @param {(error?: import('fastify').FastifyError) => void} done Function to call when the plugin is done initialising
   */
  async run(server, _, done) {
    server.addHook('onRequest', (req, res, done) => {
      const ratelimit = this.ratelimits.inc(req.raw.url, req.connection.remoteAddress);

      // Check if the headers weren't sent, so we can add our own!
      if (!res.raw.headersSent) {
        res.headers({
          'X-Ratelimit-Remaining': ratelimit.timeLeft,
          'X-Ratelimit-Limit': ratelimit.left,
          'X-Ratelimit-Reset': Math.ceil(ratelimit.resetTime.getTime() / 1000),
          'X-Ratelimit-Date': new Date().toGMTString()
        });
      }

      res
        .raw
        // Remove the IP address from the ratelimit if the response has failed or not
        .on('finish', () => this.ratelimits.decrement(req.raw.url, req.connection.remoteAddress))
        .on('close', () => {
          // If the response wasn't finished, let's decrement it
          if (!res.raw.finished) this.ratelimits.decrement(req.raw.url, req.connection.remoteAddress);
        })
        .on('error', () => this.ratelimits.decrement(req.raw.url, req.connection.remoteAddress));

      if (ratelimit.ratelimited) {
        if (!res.raw.headersSent) res.header('X-Ratelimit-Retry-After', Math.ceil(60000 / 1000));
      }

      done();
    });

    done();
  }
};