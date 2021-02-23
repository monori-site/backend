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

import stacktrace from 'stack-trace';
import Loggaby from 'loggaby';
import { sep } from 'path';

const { name } = require('../../package.json');

type ReturnConstructorType<T extends new (...args: any[]) => any> =
   T extends new (...args: any[]) => infer P ? P : any;

const path = process.cwd().split(sep);

export default class Logger {
  static get(): ReturnConstructorType<typeof Loggaby> {
    const error = new Error('Logger.get(): called!');
    const frame = stacktrace.parse(error)[1];
    const filename = frame.getFileName().split(sep).filter(r => !path.includes(r));

    return new Loggaby({
      format: `{grey}[{level.color}{level.name}{grey} | {magenta}${name}:${filename.join('/')}{magenta}{grey} | {cyan}{time}{cyan}{grey}] {white} ~> `
    });
  }
}
