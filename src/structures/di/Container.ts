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

import { Collection } from '@augu/collections';
import { isObject } from '@augu/utils';

export interface ContainerEntity {
  id: string;
}

/**
 * Represents a container of elements that is injectable,
 * this is implemented in `src/structures` for services and
 * controllers.
 *
 * @template T The object that can be injectable
 */
export default class Container<T extends ContainerEntity = ContainerEntity> extends Collection<string, T> {
  /**
   * The holdable object for type checking
   */
  private holdable: any;

  /**
   * The name of the container
   */
  public name: string;

  private static _instance: Container<any>;

  /**
   * Creates a new [Container] instance
   * @param name The name of the container
   * @param holdable The holdable object
   */
  constructor(name: string, holdable: T) {
    super();

    this.holdable = holdable;
    this.name = name;

    if (!Container._instance)
      Container._instance = this;
  }

  /**
   * Returns the container instance
   * @template T The data object type
   */
  static get<T extends ContainerEntity = ContainerEntity>(): Container<T> {
    return this._instance;
  }

  /**
   * Adds a object to this container
   * @param obj The object to add
   */
  add(obj: T) {
    if (!isObject(obj) || Array.isArray(obj) || !obj.hasOwnProperty('id')) {
      // i need to make this better
      const message = !isObject(obj)
        ? '`obj` was not a object'
        : Array.isArray(obj)
          ? 'Bulk adding objects is not supported, use `Container.bulkAdd` to bulk add objects.'
          : !obj.hasOwnProperty('id')
            ? '`obj` is not a [ContainerEntity]. Implement `id` to use this.'
            : undefined;

      // shouldn't be undefined but just in case!
      if (message !== undefined)
        throw new SyntaxError(message);
      else
        return null;
    }

    const existing = this.get(obj.id);
    if (existing)
      return existing; // not me for sure :^)

    if (!(obj instanceof this.holdable))
      throw new SyntaxError('`obj` was not a instanceof the holdable');

    this.set(obj.id, obj);
    return obj;
  }
}
