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
/// <reference types="../node_modules/@types/jest" />
// Tests for the Utilities aspect of Monori

const { sep, getPath, toPercent } = require('../src/util');

const windows = process.platform === 'win32' ? it : it.skip;
const unix = !['win32'].includes(process.platform) ? it : it.skip;

describe('Utilities', () => {
  windows('Return "\\" as the seperator', () => expect(sep).toBe('\\'));
  unix('Return "/" as the seperator', () => expect(sep).toBe('/'));

  it('should append "uwu"', () => expect(getPath('uwu')).toBe(`${process.cwd()}${sep}uwu`));
  it('should return "50.75%"', () => expect(toPercent(50.75)).toBe('50.75%'));
});