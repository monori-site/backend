/**
 * Copyright (c) 2020-2021 Arisu
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

import type Container from './Container';
import Server from '../Server';

/**
 * Represents a injectable type
 */
export enum InjectableType {
  Service    = 'service',
  Controller = 'controller'
}

const ContainerMap = {
  [InjectableType.Controller]: 'controllers',
  [InjectableType.Service]: 'services'
};

/**
 * Inject data from a container to a parameter
 * @param type The type to inject
 * @param name The name of the data to get
 * @returns A [ParameterDecorator] to use
 */
function Inject(type: InjectableType, name: string): PropertyDecorator {
  if (!InjectableType.hasOwnProperty(type))
    throw new TypeError(`Injectable '${type}' was not invalid (${Object.keys(InjectableType).map(r => `InjectableType.${r}`).join(' or ')})`);

  return (target: any, property: PropertyKey) => {
    const server = Server.instance();
    const containerType = ContainerMap[type];

    Object.defineProperty(target, property, {
      get: () => {
        const data = (server[containerType] as Container<{ name: string }>).get(name);
        if (data === undefined)
          throw new TypeError(`${type} ${name} for parameter "${String(property)}" doesn't exist`);

        return data;
      },
      enumerable: true,
      configurable: true
    });
  };
}

/**
 * Inject a service to a property
 * @param name The name of the service
 */
export const Service = (name: string): PropertyDecorator =>
  Inject(InjectableType.Service, name);

/**
 * Inject a database controller to a property
 * @param name The name of the service
 */
export const Controller = (name: string): PropertyDecorator =>
  Inject(InjectableType.Controller, name);

/**
 * Injects the configuration to a property
 */
export function Config(): PropertyDecorator {
  return (target, key) => {
    const server = Server.instance();
    Object.defineProperty(target, key, {
      get: () => server.config,
      enumerable: true,
      configurable: true
    });
  };
}
