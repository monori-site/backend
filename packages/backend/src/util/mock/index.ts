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

import { Website, RouteDefinition, BaseRouter, Route, Method } from '../../struct';
import { randomBytes } from 'crypto';

/**
 * Mocks what a Router instance should be like
 * @param prefix The prefix of the router
 * @param site The mocked website, if none was provided;
 * it uses `mockWebsite` with the default config with `mockConfig`
 * 
 * @returns A router instance
 */
export function mockRouter(prefix: string): MockedRouter {
  const _Router = (class MockedRouter extends BaseRouter {
    public mocked: boolean;

    constructor(prefix: string) {
      super(prefix);
      this.mocked = true;
    }

    mockRegister(route: RouteDefinition): RouteAdditionResult {
      const path = Route.getPrefix(this.prefix, route.prefix);
      route.prefix = path;

      const id = randomBytes(4).toString('hex');
      this.routes.set(id, route);

      return {
        path,
        id
      };
    }
  });

  const router = new _Router(prefix);
  return router;
}

/** Represents the return value of `MockedRouter#mockRegister` */
interface RouteAdditionResult {
  /** The path */
  path: string;

  /** The ID of the route */
  id: string;
}

/** Represents a "mocked" router from `mockRouter` */
export interface MockedRouter extends BaseRouter {
  /**
   * Adds a route to the router
   * @param route The mocked route
   */
  mockRegister(route: RouteDefinition): RouteAdditionResult;

  /**
   * If the router is mocked, this is not added in the normal routers
   */
  mocked: boolean;
}

/** Represents the options for `mockRoute` */
interface MockedRouteOptions {
  /** If the route should add authenication */
  authenicate?: boolean;

  /** If we should require any parameters */
  parameters?: { name: string; required: boolean }[];

  /** If we should require any parameters */
  queries?: { name: string; required: boolean }[];

  /** If the route should be ran by an administrator */
  admin?: boolean;

  /** The method to use */
  method: Method;

  /** If we should require a body */
  body?: { name: string; required: boolean }[];
}

/**
 * Adds a mock route to a mocked router instance
 * @param path The path of the route
 * @param opts The options to use
 */
export function mockRoute(path: string, router: MockedRouter, opts: MockedRouteOptions) {
  if (!router.hasOwnProperty('mocked')) throw new Error('Router instance doesn\'t have `mocked`, did you do `mockRouter`?');

  const admin = opts.hasOwnProperty('admin') ? opts.admin! : false;
  const auth = opts.hasOwnProperty('authenicate') ? opts.authenicate! : false;

  const route: RouteDefinition = {
    authenicate: auth,
    admin,
    method: opts.method,
    prefix: path,
    parameters: opts.parameters || [],
    queries: opts.queries || [],
    body: opts.body || [],
    type: 'none',
    async run(req, res) {
      res.status(200).send('haha data go brrr');
    }
  };

  const $symbol = Symbol('$routes');
  if (!router.constructor[$symbol]) router.constructor[$symbol] = [];

  (router.constructor[$symbol] as RouteDefinition[]).push(route);
  return route;
}