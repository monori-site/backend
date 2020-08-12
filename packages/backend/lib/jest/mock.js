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

const { Router, Route } = require('../../src/structures');

/**
 * Creates a new instance of what a Router should feel like
 * @param {string} prefix The prefix
 */
const mockRouter = (prefix) => {
  const MockedRouter = (class MockedRouter extends Router {
    /**
     * Creates a new [MockedRouter] instance
     */
    constructor() {
      super(prefix);

      this.mocked = true;
    }

    /**
     * Adds a route to this router
     * @param {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} method The method
     * @param {string} path The path
     * @param {RouteRunner} run The run function
     * @returns {Route} The newly created route
     */
    add(method, prefix, run) {
      // Override the default behaviour
      const path = Route.prefix(prefix, this.prefix);
      this.routes.set(path, new Route(method, path, run));

      return new Route(method, path, run);
    }
  });

  return new MockedRouter(prefix);
};

module.exports = { mockRouter };