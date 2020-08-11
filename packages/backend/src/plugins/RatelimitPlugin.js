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
     * @type {Collection<Collection<{ ratelimited: boolean; left: number; }>>}
     */
    this.ratelimits = new Collection();
  }

  /**
   * Gets the request limit before halting
   */
  get requests() {
    return 100;
  }

  /**
   * The time before halting
   */
  get time() {
    return 60000;
  }
  /**
   * Abstract function to run the plugin
   * @param {import('fastify').FastifyInstance} server The server
   * @param {any} opts Any options to use
   * @param {(error?: import('fastify').FastifyError) => void} done Function to call when the plugin is done initialising
   */
  async run(server, _, next) {
    server.addHook('onRoute', opts => {

    });

    next();
  }
};