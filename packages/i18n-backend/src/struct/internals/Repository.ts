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

import type { Website } from './Website';
import { getKindOf } from '../../util';

const UNSUPPORTED = ['object', 'function', 'class', 'array', 'symbol', 'undefined', 'null'];

/** Represents a SQL column */
export interface Column {
  /** If this column should be null */
  nullable: boolean;

  /** If this column is the primary key */
  primary: boolean;

  /** The name of the column */
  name: string;

  /** The JavaScript type */
  type: 'string' | 'number' | 'bigint' | 'float' | 'boolean';
}

/** Represents the repository's information */
interface RepositoryInfo {
  /** The columns to add if the table doesn't exist */
  columns: Column[];

  /** The table name */
  table: string;
}

/**
 * Converts this column's type to a SQL string
 * @param column The column
 */
export function convertColumnToSql(column: Column) {
  const primary = column.primary ? ' PRIMARY KEY' : '';
  const nullable = column.nullable ? ' NULL' : '';

  switch (column.type) {
    case 'boolean': return `${column.name.toLowerCase()} BOOL${nullable}${primary}`;
    case 'string': return `${column.name.toLowerCase()} TEXT${nullable}${primary}`;
    case 'bigint': return `${column.name.toLowerCase()} BIGINT${nullable}${primary}`;
    case 'number': return `${column.name.toLowerCase()} INTEGER${nullable}${primary}`;
    case 'float': return `${column.name.toLowerCase()} DOUBLE${nullable}${primary}`;

    default: throw new Error(`JavaScript type "${column.type}" is not supported in SQL`);
  }
}

/**
 * Adds `'` if the type if a string
 * @param type The value to escape
 */
function escapeSQL(type: any) {
  const kind = getKindOf(type);
  return kind === 'string' ? `'${type}'` : type;
}

/**
 * Represents a "repository" for the database
 * @typeparam T: The data structure of the repository
 */
export class Repository<T = unknown> {
  /** The website */
  public website!: Website;

  /** The columns to use */
  public columns: Column[];

  /** The repository table's name */
  public table: string;

  /**
   * Constructs a new Repository
   * @param info The information
   */
  constructor(info: RepositoryInfo) {
    this.columns = info.columns;
    this.table = info.table;

    this.validate();
  }

  /**
   * Validates the repository
   */
  private validate() {
    if (!this.columns.length) throw new Error('No columns were added');
    for (const column of this.columns) {
      if (UNSUPPORTED.includes(column.type)) throw new Error(`JavaScript type "${column.type}" isn't supported in SQL`);
    }

    return this.createTable();
  }

  /**
   * Creates the table if it doesn't exist
   */
  private async createTable() {
    if (!(await this.website.database.exists(this.table))) await this.website.database.createTable(this);
  }

  /**
   * Initialises the repository
   * @param website The website
   */
  init(website: Website) {
    this.website = website;
  }

  /**
   * Deletes a entry from the database
   * @param column The column
   * @param value The value
   */
  delete(column: string, value: any) {
    const hecc = this.columns.filter(x => x.name === column && x.primary);
    if (!hecc.length) throw new Error(`Column "${column}" was not found or it wasn't the primary column`);

    return this.website.database.query(`DELETE FROM ${this.table.toLowerCase()} WHERE ${column.toLowerCase()} = ${escapeSQL(value)};`);
  }

  /**
   * Creates a new packet to the database
   * @param data The data packet
   */
  create(data: T) {
    const columns = `(${this.columns.map(s => s.name.toLowerCase()).join(', ')})`;
    const items: string[] = [];

    for (const [, item] of Object.entries(data)) {
      items.push(escapeSQL(item));
    }

    return this.website.database.query(`INSERT INTO ${this.table.toLowerCase()} ${columns} VALUES (${items.join(', ')});`);
  }

  /**
   * Fetch an item from the database
   * @param column The column to fetch from
   * @param value The value to find
   */
  get(column: string, value: any) {
    const hecc = this.columns.filter(x => x.name === column && x.primary);
    if (!hecc.length) throw new Error(`Column "${column}" was not found or it wasn't the primary column`);

    return this.website.database.query(`SELECT * FROM ${this.table.toLowerCase()} WHERE ${column.toLowerCase()} = ${escapeSQL(value)};`);
  }

  /**
   * Updates a packet from the database
   * @param column The column to update the packet
   * @param value The value to fetch
   * @param packet The update packet
   */
  async update(column: string, value: any, packet: { [x: string]: unknown }) {
    const hecc = this.columns.filter(x => x.name === column && x.primary);
    if (!hecc.length) throw new Error(`Column "${column}" was not found or it wasn't the primary column`);

    const items: string[] = [];
    for (const [key, val] of Object.entries(packet)) items.push(`UPDATE ${this.table.toLowerCase()} SET ${key.toLowerCase()} = ${escapeSQL(val)} WHERE ${column.toLowerCase()} = ${escapeSQL(value)}`);
  
    // i feel bad for doing this
    // TODO: Find a better way to bulk update items
    for (const item of items) await this.website.database.query(item);
  }
}