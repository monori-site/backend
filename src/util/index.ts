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

import { Months } from './Constants';

/**
 * Static class to handle any repeating code
 */
export default class Util {
  constructor() {
    throw new SyntaxError('Use the static methods, this class isn\'t avaliable to be constructed');
  }

  /**
   * Returns the seperator for the correspondant Operating System
   */
  static get sep() {
    return process.platform === 'win32' ? '\\' : '/';
  }

  /**
   * Converts a float number to a percentage string
   * @param float The float
   * @returns The percentage string
   */
  static toPercent(float: string) {
    const fl = parseFloat(float);
    return `${fl.toFixed(2)}%`;
  }

  /**
   * Joins the current directory with any other appending directories
   * @param paths The paths to conjoin
   * @returns The paths conjoined 
   */
  static getPath(...paths: string[]) {
    return `${process.cwd()}${Util.sep}${paths.join(Util.sep)}`;
  }

  /**
   * Formats any byte-integers to a humanizable string
   * @param bytes The number of bytes the file is
   */
  static formatSize(bytes: number) {
    const kilo = bytes / 1024;
    const mega = kilo / 1024;
    const giga = mega / 1024;

    if (kilo < 1024) return `${kilo.toFixed(1)}KB`;
    if (kilo > 1024 && mega < 1024) return `${mega.toFixed(1)}MB`;
    else return `${giga.toFixed(1)}GB`;
  }

  /**
   * If the OS is running Node.js 10 or higher
   */
  static isNode10() {
    const ver = process.version.split('.')[0].replace('v', '');
    const num = Number(ver);

    return num === 10 || num > 10;
  }

  /**
   * Escapes the time variable for the [Logger]
   * @param value The value
   */
  static escapeTime(value: number) {
    return `0${value}`.slice(-2);
  }

  /**
   * Gets the current date
   */
  static getDate() {
    const now = new Date();

    const hours   = this.escapeTime(now.getHours());
    const minutes = this.escapeTime(now.getMinutes());
    const seconds = this.escapeTime(now.getSeconds());

    return `[${this.escapeTime(now.getDate())}/${this.escapeTime(now.getMonth() + 1)}/${now.getFullYear()} | ${hours}:${minutes}:${seconds}]`;
  }

  /**
   * Formats a number to add an `s` if the index is over 0
   * @param item The item to push
   */
  static format(index: number) {
    return index > 1 ? 's' : '';
  }
  
  /**
   * Returns a humanized date
   * @param ms The amount of milliseconds to convert
   */
  static humanize(ms: number) {
    const weeks = Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
    ms -= weeks * 1000 * 60 * 60 * 24 * 7;
  
    const days = Math.floor(ms / 1000 / 60 / 60 / 24);
    ms -= days * 1000 * 60 * 60 * 24;
  
    const hours = Math.floor(ms / 1000 / 60 / 60);
    ms -= hours * 1000 * 60 * 60;
  
    const mins = Math.floor(ms / 1000 / 60);
    ms -= mins * 1000 * 60;
  
    const sec = Math.floor(ms / 1000);
    const humanized: string[] = [];

    if (weeks > 0) humanized.push(`${weeks} week${this.format(weeks)}`);
    if (days > 0) humanized.push(`${days} day${this.format(days)}`);
    if (hours > 0) humanized.push(`${hours} hour${this.format(hours)}`);
    if (mins > 0) humanized.push(`${mins} minute${this.format(mins)}`);
    if (sec > 0) humanized.push(`${sec} seconds`);

    return humanized.join(', ');
  }
}
