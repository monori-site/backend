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

import type { FastifyRequest as Request, FastifyReply as Response } from 'fastify';
import type { BaseRouter } from '../internals';
import { getOption } from '../../util';

export enum Method {
  Delete = 'delete',
  Patch = 'patch',
  Post = 'post',
  Put = 'put',
  Get = 'get'
}

const SYMBOL = Symbol('$routes');

/** Represents a route definition */
export interface RouteDefinition {
  /**
   * Runs the route when it gets called
   * @param req The request object from Fastify
   * @param res The response object from Fastify
   * @returns A promise of nothing
   */
  run(this: BaseRouter, req: Request, res: Response): Promise<void>;

  /** Any required parameters */
  parameters: RequiredParameters[];

  /** If we should be authenicated to use this route */
  authenicate: boolean;

  /** Any required queries */
  queries: RequiredQueries[];

  /** The route's prefix */
  prefix: string;

  /** If we should be an admin to use this route */
  admin: boolean;

  /** The route's method */
  method: Method;

  /** Any required body loads */
  body: RequiredBody[];

  /** The type of authenication to use */
  type: 'jwt' | 'none';
}

/**
 * Get all of the route definitions 
 * @param target The class to find the definitions
 * @returns An array of definitions or an empty one if none were found
 */
export function getRoutes(target: any): RouteDefinition[] {
  if (target.constructor == null) return [];

  const definitions = target.constructor[SYMBOL];
  if (!Array.isArray(definitions)) return [];

  return definitions;
}

/** Options when using the decorators */
interface RouteDecoratorOptions {
  /** Any required parameters */
  parameters?: RequiredParameters[];

  /** If the user should be logged in to access */
  authenicate?: boolean;

  /** Any required queries */
  queries?: RequiredQueries[];

  /** If the user should be an admin to access */
  admin?: boolean;

  /** Any required body loads */
  body?: RequiredBody[];

  /** The type of authenication to use */
  type?: 'jwt' | 'none';
}

interface Required {
  /** If it's required */
  required: string;

  /** The name */
  name: string;
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RequiredBody extends Required {}
export interface RequiredQueries extends Required {}
export interface RequiredParameters extends Required {}
/* eslint-enable @typescript-eslint/no-empty-interface */

/**
 * Adds this route as a GET method
 * @param route The route prefix
 * @param options The options
 */
export const Get = (route: string, options?: RouteDecoratorOptions): MethodDecorator =>
  (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const name = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`All route definitions must be in a non-static class (Method ${name})`);
    if (!route.startsWith('/')) throw new SyntaxError(`Route must needs to start with "/" (Method ${name})`);
    if (!target.constructor[SYMBOL]) target.constructor[SYMBOL] = [];

    (target.constructor[SYMBOL] as RouteDefinition[]).push({
      authenicate: options ? getOption(options, 'authenicate', false) : false,
      parameters: options ? getOption(options, 'parameters', []) : [],
      queries: options ? getOption(options, 'queries', []) : [],
      prefix: route,
      method: Method.Get,
      admin: options ? getOption(options, 'admin', false) : false,
      body: options ? getOption(options, 'body', []) : [],
      type: options ? getOption(options, 'type', 'none') : 'none',
      run: descriptor.value
    });
  };

/**
 * Adds this route as a Put method
 * @param route The route prefix
 * @param options The options
 */
export const Put = (route: string, options?: RouteDecoratorOptions): MethodDecorator =>
  (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const name = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`All route definitions must be in a non-static class (Method ${name})`);
    if (!route.startsWith('/')) throw new SyntaxError(`Route must needs to start with "/" (Method ${name})`);
    if (!target.constructor[SYMBOL]) target.constructor[SYMBOL] = [];

    (target.constructor[SYMBOL] as RouteDefinition[]).push({
      authenicate: options ? getOption(options, 'authenicate', false) : false,
      parameters: options ? getOption(options, 'parameters', []) : [],
      queries: options ? getOption(options, 'queries', []) : [],
      prefix: route,
      method: Method.Put,
      admin: options ? getOption(options, 'admin', false) : false,
      body: options ? getOption(options, 'body', []) : [],
      type: options ? getOption(options, 'type', 'none') : 'none',
      run: descriptor.value
    });
  };

/**
 * Adds this route as a POST method
 * @param route The route prefix
 * @param options The options
 */
export const Post = (route: string, options?: RouteDecoratorOptions): MethodDecorator =>
  (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const name = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`All route definitions must be in a non-static class (Method ${name})`);
    if (!route.startsWith('/')) throw new SyntaxError(`Route must needs to start with "/" (Method ${name})`);
    if (!target.constructor[SYMBOL]) target.constructor[SYMBOL] = [];

    (target.constructor[SYMBOL] as RouteDefinition[]).push({
      authenicate: options ? getOption(options, 'authenicate', false) : false,
      parameters: options ? getOption(options, 'parameters', []) : [],
      queries: options ? getOption(options, 'queries', []) : [],
      prefix: route,
      method: Method.Post,
      admin: options ? getOption(options, 'admin', false) : false,
      body: options ? getOption(options, 'body', []) : [],
      type: options ? getOption(options, 'type', 'none') : 'none',
      run: descriptor.value
    });
  };

/**
 * Adds this route as a PATCH method
 * @param route The route prefix
 * @param options The options
 */
export const Patch = (route: string, options?: RouteDecoratorOptions): MethodDecorator =>
  (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const name = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`All route definitions must be in a non-static class (Method ${name})`);
    if (!route.startsWith('/')) throw new SyntaxError(`Route must needs to start with "/" (Method ${name})`);
    if (!target.constructor[SYMBOL]) target.constructor[SYMBOL] = [];

    (target.constructor[SYMBOL] as RouteDefinition[]).push({
      authenicate: options ? getOption(options, 'authenicate', false) : false,
      parameters: options ? getOption(options, 'parameters', []) : [],
      queries: options ? getOption(options, 'queries', []) : [],
      prefix: route,
      method: Method.Patch,
      admin: options ? getOption(options, 'admin', false) : false,
      body: options ? getOption(options, 'body', []) : [],
      type: options ? getOption(options, 'type', 'none') : 'none',
      run: descriptor.value
    });
  };

/**
 * Adds this route as a DELETE method
 * @param route The route prefix
 * @param options The options
 */
export const Delete = (route: string, options?: RouteDecoratorOptions): MethodDecorator =>
  (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const name = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`All route definitions must be in a non-static class (Method ${name})`);
    if (!route.startsWith('/')) throw new SyntaxError(`Route must needs to start with "/" (Method ${name})`);
    if (!target.constructor[SYMBOL]) target.constructor[SYMBOL] = [];

    (target.constructor[SYMBOL] as RouteDefinition[]).push({
      authenicate: options ? getOption(options, 'authenicate', false) : false,
      parameters: options ? getOption(options, 'parameters', []) : [],
      queries: options ? getOption(options, 'queries', []) : [],
      prefix: route,
      method: Method.Delete,
      admin: options ? getOption(options, 'admin', false) : false,
      body: options ? getOption(options, 'body', []) : [],
      type: options ? getOption(options, 'type', 'none') : 'none',
      run: descriptor.value
    });
  };