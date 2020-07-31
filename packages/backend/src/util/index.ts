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

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

/**
 * Returns the path seperator of the corresponding Operating System
 */
export const sep = process.platform === 'win32' ? '\\' : '/';

/**
 * Humanizes any millisecond interval to a human date string
 * @param ms The milliseconds to convert
 * @returns Human date string
 */
export function humanize(ms: number) {
  const months = Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 12);
  ms -= months * 1000 * 60 * 60 * 24 * 7 * 12;

  const weeks = Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
  ms -= weeks * 1000 * 60 * 60 * 24 * 7;

  const days = Math.floor(ms / 1000 / 60 / 60 / 24);
  ms -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(ms / 1000 / 60 / 60);
  ms -= hours * 1000 * 60 * 60;

  const mins = Math.floor(ms / 1000 / 60);
  ms -= mins * 1000 * 60;

  const sec = Math.floor(ms / 1000);

  let humanized = '';
  if (months > 0) humanized += `${months} month${months > 1 ? 's' : ''}, `;
  if (weeks > 0) humanized += `${weeks} week${weeks > 1 ? 's' : ''}, `;
  if (days > 0) humanized += `${days} day${days > 1 ? 's' : ''}, `;
  if (hours > 0) humanized += `${hours} hour${hours > 1 ? 's' : ''}, `;
  if (mins > 0) humanized += `${mins} minute${mins > 1 ? 's' : ''}, `;
  if (sec > 0) humanized += `${sec} second${sec > 1 ? 's' : ''}`;

  return humanized;
}

/**
 * Gets the commit hash or `null` if there is no git repository
 * @returns The hash or `null`
 */
export function getCommitHash() {
  if (!existsSync(join(process.cwd(), '..', '.git'))) return null;

  const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' });
  return hash.slice(0, 8);
}

/**
 * Gets a value from an object or uses the default value
 * @param options The options to get from
 * @param prop The property to get
 * @param defaultValue The default value if it doesn't exist
 * @returns The value from `options` or `defaultValue`
 */
export function getOption<O, V = unknown>(options: O, prop: keyof O, defaultValue: V): V {
  // this feels redudant but i give zero fucks
  return options[prop as any] ? options[prop as any]! : defaultValue;
}

/**
 * Appends paths to the current process directory
 * @param paths The paths to add
 * @returns The paths conjoined
 */
export function getPath(...paths: string[]) {
  return `${process.cwd()}${sep}${paths.join(sep)}`;
}

/**
 * Stringifies a JavaScript object
 * @param value The value to use
 */
export function getKindOf(value: unknown) {
  if (!['object', 'function', 'number'].includes(typeof value)) return typeof value;
  if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'float';
  if (Array.isArray(value)) return 'array';
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') {
    const type = value.toString();

    if (type.startsWith('function')) return 'function';
    if (type.startsWith('class')) return 'class';
  }

  return 'object';
}

/**
 * Asynchronous way to halt the process for x amount of milliseconds
 * 
 * Since `Promise` are macro-tasks and stuff like setTimeout, setInterval are micro-tasks,
 * the event loop will run any synchronous code first THEN all of the Promises in that code,
 * then all of the micro-tasks; so it's an endless loop of doing all 3 I described.
 * 
 * Why is this important? We can basically "manipulate" the event-loop to halt a certain
 * process until another process is done, I know... I'm weird at explaining stuff.
 * 
 * @param ms The amount of time to "sleep"
 * @returns An unknown Promise
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}