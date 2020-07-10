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

/// <reference path='../../node_modules/@types/jest/index.d.ts' />

import * as mocked from '../util/mock';
import { Method } from '../struct';

describe('Routing', () => {
  let router!: mocked.MockedRouter;

  beforeEach(() => {
    router = mocked.mockRouter('/');
  });

  it('should be a new mocked route', () => {
    const route = mocked.mockRoute('/', router, { method: Method.Get });

    expect(route).toBeDefined();
    expect(route.prefix).toBe('/');
    expect(route.method).toBe(Method.Get);
  });

  it('should return /u/abcd when added to the router', () => {
    const uRouter = mocked.mockRouter('/u');
    const route = mocked.mockRoute('/abcd', uRouter, { method: Method.Get });
    expect(route).toBeDefined();
    expect(route.prefix).toBe('/abcd');

    const { path } = uRouter.mockRegister(route);
    expect(uRouter.routes.empty).toBeFalsy();
    expect(uRouter.routes.size).toBe(1);
    expect(route.prefix).toBe(path);
  });
});