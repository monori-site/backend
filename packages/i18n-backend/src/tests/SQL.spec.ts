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

import { convertColumnToSql, Column, convertArraysToSql } from '../struct';

describe('SQL', () => {
  let columns!: Column[];
  beforeEach(() => {
    columns = [
      {
        nullable: true,
        primary: false,
        array: false,
        name: 'key',
        type: 'string'
      },
      {
        nullable: false,
        primary: true,
        array: false,
        name: 'gay',
        type: 'number'
      },
      {
        nullable: false,
        primary: false,
        array: false,
        name: 'uwu',
        type: 'boolean'
      },
      {
        nullable: false,
        primary: false,
        array: true,
        name: 'owo',
        type: 'string'
      },
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

  it('column "owo" should equal "owo TEXT[]"', () => {
    const column = columns.find(c => c.name === 'owo');
    expect(column).toBeDefined();

    const sql = convertColumnToSql(column!);
    expect(sql).toBe('owo TEXT[]');
  });

  it('should return "uwu TEXT[12]" as the SQL string', () => {
    const column: Column = {
      nullable: false,
      primary: false,
      array: true,
      name: 'uwu',
      type: 'string',
      size: 12
    };

    const sql = convertColumnToSql(column);
    expect(sql).toBe('uwu TEXT[12]');
  });

  it('should return "ARRAY[a, b, c]"', () => {
    const sql = convertArraysToSql(['a', 'b', 'c']);
    expect(sql).toBe('ARRAY[a, b, c]');
  });

  it('should return "ARRAY[]"', () => {
    const sql = convertArraysToSql([]);
    expect(sql).toBe('ARRAY[]');
  });
});