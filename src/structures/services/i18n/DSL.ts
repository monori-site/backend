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

import type { i18nService } from '../..';
import { isObject } from '@augu/utils';

const ExpressionRegex = /[$]\(([\w\.]+)\)/gi;

/**
 * Simple query language for handling translations with Arisu.
 *
 * A simple expression would look like:
 * ```js
 * "Project $(project.title) is $(project.completed) completed."
 * ```
 *
 * By using this class, it'll traverse over any expression using the `$()` syntax to replace
 * any strings and places them.
 *
 * Simple arguments would be like:
 * ```json
 * {
 *   "project.title": "Arisu",
 *   "project.completed": 100
 * }
 * ```
 *
 * By running `i18nDSL.parse(<language>, "<nodes>")`, it'll complete the string with the arguments provided above:
 * ```js
 * "Project Arisu is 100% completed."
 * ```
 */
export default class i18nDSL {
  private i18n: i18nService;
  constructor(i18n: i18nService) {
    this.i18n = i18n;
  }

  private _translate(str: string, args?: { [x: string]: string }) {
    return str.replace(ExpressionRegex, (_, key) => {
      if (args !== undefined) {
        const value = String(args[key]);

        if (value === '')
          return '?';
        else if (args.hasOwnProperty(key))
          return value;
        else
          return '?';
      } else {
        return '?';
      }
    });
  }

  /**
   * Parses the language key and returns the value
   * @param language The language to populate
   * @param nodes The nodes to find the language by
   * @param args Any additional arguments to implement
   */
  parse<K extends keyof i18nService['languages']>(language: K, nodes: string, args?: { [x: string]: string }) {
    if (!this.i18n.languages.hasOwnProperty(language))
      throw new TypeError(`Language "${language}" was not initialized or not found.`);

    let strings: any = language;
    const fragments = nodes.split('.');

    for (const frag of fragments) {
      try {
        strings = strings[frag];
      } catch {
        strings = null;
      }
    }

    if (strings === null)
      throw new TypeError(`Nodes "${nodes}" was not found in language map`);

    if (isObject(strings) && !Array.isArray(strings))
      throw new TypeError(`Nodes "${nodes}" is a object, use a different key node`);

    if (Array.isArray(strings)) {
      return strings.map(str => this._translate(str, args)).join('\n');
    } else {
      return this._translate(strings, args);
    }
  }
}
