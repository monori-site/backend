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
/// <reference path='../../node_modules/@types/node/index.d.ts' />

import * as utils from '../util';

const windows = process.platform === 'win32' ? it : it.skip;
const unix = ['darwin', 'linux'].includes(process.platform) ? it : it.skip;

describe('Utilities', () => {
  windows('should return "\\" on Windows', () =>
    expect(utils.sep).toBe('\\')
  );

  unix('should return "/" on Unix (MacOS, Linux)', () =>
    expect(utils.sep).toBe('/')
  );

  it('should be "3 seconds" as the humanized date', () =>
    expect(utils.humanize(3000)).toBe('3 seconds')
  );

  it('should have prop "uwu" in object', () => {
    const obj = { uwu: 'abcd' };
    const option = utils.getOption(obj, 'uwu', null);

    expect(option).toBeDefined();
    expect(option).toBe('abcd');
  });

  it('should not have prop "owo" in object', () => {
    const obj = { uwu: 'abcd' };
    // @ts-ignore
    const option = utils.getOption(obj, 'owo', 'uwu');

    expect(option).toBeDefined();
    expect(option).toBe('uwu');
  });

  it('should of appended "uwu" after the process\' current directory', () => 
    expect(utils.getPath('uwu')).toBe(`${process.cwd()}${utils.sep}uwu`)
  );

  it('should return "number" as the current type', () => 
    expect(utils.getKindOf(1)).toBe('number')
  );
});