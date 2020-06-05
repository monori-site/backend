// Decorator utilities for @Route, which defines a Route for it's base Router
import { FastifyRequest as Request, FastifyReply as Response } from 'fastify';
import type { BaseRouter, Method as RouteMethod } from '..';
import type { ServerResponse } from 'http';

const SYMBOL = Symbol('$routes');

/** Represents a "route" */
export interface RouteDefinition {
  /**
   * Runs the route when it gets called
   * @param req The request object from Fastify
   * @param res The response object from Fastify
   * @returns A promise of nothing
   */
  run(this: BaseRouter, req: Request, res: Response<ServerResponse>): Promise<void>;

  /** Any specific requirements to use */
  requirements?: RouteRequirements;

  /** The method to use */
  method: RouteMethod;

  /** The path (must be prefixed with `/`) */
  path: string;
}

/** Any specific requirements to run the route */
interface RouteRequirements {
  /** If you should be logged in to use this route */
  authenicate?: boolean;

  /** If you should be an administrator to use this route */
  admin?: boolean;
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

interface RouteDecoratorOptions {
  /** If the user should be logged in to access */
  authenicate?: boolean;

  /** If the user should be an admin to access */
  admin?: boolean;

  /** The method to use */
  method: RouteMethod; 
}

/**
 * Defines a "Route" instance as a decorator
 * @param route The route path itself
 * @param options Any additional options to use
 */
export const Route = (route: string, options: RouteDecoratorOptions): MethodDecorator =>
  (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const name = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`All route definitions must be in a non-static class (Method ${name})`);
    if (!route.startsWith('/')) throw new SyntaxError(`Route must needs to start with "/" (Method ${name})`);
    if (!target.constructor[SYMBOL]) target.constructor[SYMBOL] = [];

    (target.constructor[SYMBOL] as RouteDefinition[]).push({
      requirements: {
        authenicate: options.hasOwnProperty('authenicate') ? options.authenicate! : false,
        admin: options.hasOwnProperty('admin') ? options.admin! : false
      },
      method: options.method,
      path: route,
      run: descriptor.value
    });
  };