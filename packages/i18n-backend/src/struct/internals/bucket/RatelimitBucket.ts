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

import type { FastifyRequest } from 'fastify';
import { Collection } from '@augu/immutable';

/**
 * Handles all ratelimits and halts the process if they exceed the cooldown
 */
export default class RatelimitBucket {
  /**
   * Avaliable items as a Collection
   * 
   * key: route
   * 
   * value: collection (key: ip, value: cooldown amount)
   */
  private items: Collection<Collection<number>>;

  /**
   * Constructs a new instance of the RatelimitBucket class
   */
  constructor() {
    this.items = new Collection();
  }

  /**
   * Starts the process
   * @param req The request
   * @returns A number of milliseconds until the ratelimit stops
   */
  handle(route: string, req: FastifyRequest) {
    if (!this.items.has(route)) this.items.set(route, new Collection());

    const cooldown = 5000;
    const items = this.items.get(route)!;
    
  }
}