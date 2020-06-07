//* Data utilities for Jest, nothing special
import { Website, BaseRouter, RouteDefinition, Method } from '../core';
import { Configuration } from '../core/internals/Website';
import { createElement } from 'react';
import DOMServer from 'react-dom/server';
import { join } from 'path';

/**
 * Mocks what the site should be like
 * @param config Custom configuration to use, it'll use `mockConfig` as the default
 * @returns A new website instance with a custom config or the default config
 * if none was found
 */
export function mockWebsite(config?: Configuration) {
  const cfg = config ? config! : mockConfig();
  return new Website(cfg);
}

/**
 * Mocks what the configuration should be like
 * @returns A default configuration of what it should be like
 */
export function mockConfig(): Configuration {
  return ({
    databaseUrl: 'mongodb://localhost:27017',
    environment: 'development',
    analytics: true,
    discord: {
      clientID: '12345678910111213',
      clientSecret: 'bruhmomento69',
      scopes: ['bro', 'your', 'gay'],
      callbackUrls: {
        development: 'http://bruh.moment',
        production: 'https://bruh.moment'
      }
    },
    github: {
      clientID: '12345678910111213',
      clientSecret: 'bruhmomento69',
      scopes: ['bro', 'your', 'gay'],
      callbackUrls: {
        development: 'http://bruh.moment',
        production: 'https://bruh.moment'
      }
    },
    redis: {
      host: 'localhost',
      port: 6379,
      db: 4
    },
    secret: 'b'.repeat(32),
    color: '#ffffff',
    port: 6969
  });
}

/**
 * Mocks what a Router instance should be like
 * @param prefix The prefix of the router
 * @param site The mocked website, if none was provided;
 * it uses `mockWebsite` with the default config with `mockConfig`
 * 
 * @returns A router instance
 */
export function mockRouter(prefix: string, site: Website = mockWebsite()): MockedRouter {
  const _Router = (class MockedRouter extends BaseRouter {
    public mocked: boolean;

    constructor(site: Website, prefix: string) {
      super(site, prefix);
      this.mocked = true;
    }
  });

  return new _Router(site, prefix);
}

/** Represents a "mocked" router from `mockRouter` */
interface MockedRouter extends BaseRouter {
  /**
   * If the router is mocked, this is not added in the normal routers
   */
  mocked: boolean;
}

/** Represents the options for `mockRoute` */
interface MockedRouteOptions {
  /** If the route should add authenication */
  authenicate?: boolean;

  /** If the route should be ran by an administrator */
  admin?: boolean;

  /** The method to use */
  method: Method;
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
    requirements: {
      authenicate: auth,
      admin
    },
    method: opts.method,
    path,
    async run(req, res) {
      res.status(200).send('haha data go brrr');
    }
  };

  (router.constructor[Symbol('$routes')] as RouteDefinition[]).push(route);
  return route;
}

/**
 * Acts the return value of `mockRenderEngine`
 */
type RendererEngine = (path: string, props?: Record<string, unknown>) => RendererResult;

/** Represents the result */
interface RendererResult {
  /** The component instance */
  // TODO: Type this when you find a solution
  component: any;

  /** The HTML markup itself */
  markup: string;
}

/**
 * Creates a new "mocked" render engine
 * @returns A function that returns a result of the engine
 */
export function mockRenderEngine(): RendererEngine {
  return (path, props) => {
    if (!path.endsWith('.js')) path += '.js';

    const filepath = join(process.cwd(), 'site', path);
    let initial = '<!DOCTYPE html>';
    const component = require(filepath);
    
    initial += DOMServer.renderToStaticMarkup(createElement(component.default, props));
    return {
      component: component.default,
      markup: initial
    };
  };
}