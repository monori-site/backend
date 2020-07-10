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

import { convertColumnToSql, Column } from '../struct';

describe('SQL', () => {
  let columns!: Column[];
  beforeEach(() => {
    columns = [
      {
        nullable: true,
        primary: false,
        name: 'key',
        type: 'string'
      },
      {
        nullable: false,
        primary: true,
        name: 'gay',
        type: 'number'
      },
      {
        nullable: false,
        primary: false,
        name: 'uwu',
        type: 'boolean'
      }
    ];
  });

  it('first column should be nullable', () => 
    expect(columns[0].nullable).toBeTruthy()
  );

  it('column "gay" is the primary one', () => {
    const [column] = columns.filter(c => c.primary);

    expect(column).toBeDefined();
    expect(column.name).toBe('gay');
  });

  it('column "uwu" has the type "boolean"', () => {
    const [column] = columns.filter(c => c.name === 'uwu');

    expect(column).toBeDefined();
    expect(column.type).toBe('boolean');
  });

  it('column "uwu" should equal "uwu BOOL"', () => {
    const column = columns.find(c => c.name === 'uwu');
    expect(column).toBeDefined();

    const sql = convertColumnToSql(column!);
    expect(sql).toBe('uwu BOOL');
  });

  it('column "gay" should equal "gay INTEGER PRIMARY KEY"', () => {
    const column = columns.find(c => c.name === 'gay');
    expect(column).toBeDefined();

    const sql = convertColumnToSql(column!);
    expect(sql).toBe('gay INTEGER PRIMARY KEY');
  });

  it('column "key" should equal "key TEXT NULL"', () => {
    const column = columns.find(c => c.name === 'key');
    expect(column).toBeDefined();

    const sql = convertColumnToSql(column!);
    expect(sql).toBe('key TEXT NULL');
  });
});