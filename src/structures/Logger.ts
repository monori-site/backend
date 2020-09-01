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

import { colors, hex } from 'leeks.js';
import { inspect } from 'util';
import Util from '../util';

// Colors for the logger name and levels
const NAME_COLOR = '#74458B';
const DATE_COLOR = '#FFB9BE';
const INFO_COLOR = '#4CD2FF';
const WARN_COLOR = '#F4EABF';
const ERROR_COLOR = '#C47362';
const REQUEST_COLOR = '#78A1C0';
const UNKNOWN_COLOR = '#88838D';

const Padding: { [x: number]: string }= {
  9: '   ~>    ',
  7: '     ~>    ',
  6: '      ~>    '
};

// eslint-disable-next-line
type Message  = string | object | any[] | Error;
type LogLevel = 'request' | 'error' | 'warn' | 'info';

/**
 * Represents a [Logger], which prints out information in the console
 */
export class Logger {
  /** Hard-copy of colors, nothing special */
  public colors: typeof colors;

  /** The name of the logger */
  public name: string;

  /**
   * Creates a new [Logger] instance
   * @param name The logger's name
   */
  constructor(name: string) {
    this.colors = colors;
    this.name   = name;
  }

  /**
   * Private function to convert an Array of messages to a String
   * @param messages The messages to pass-by
   */
  private format(...messages: Message[]) {
    return messages.map((message: unknown) => {
      if (typeof message === 'string') return message;
      else if (typeof message === 'object' && !Array.isArray(message)) return inspect(message);
      else if (Array.isArray(message)) return `[${message.join(', ')} (${message.length} items)]`;
      else if (message instanceof Error) {
        const stack = [
          `${message.name}: ${message.message.slice(message.message.indexOf(message.name + ': '))}`
        ];

        if (message.stack) {
          const trace = message.stack.split('\n');
          for (let i = 0; i < trace.length; i++) stack.push(trace[i]);
        }

        return stack.join('\n');
      } else {
        return message;
      }
    }).join('\n');
  }

  /**
   * Private function to write to the console
   * @param level The level
   * @param messages The messages to pass-by
   */
  private write(level: LogLevel, ...messages: Message[]) {
    let lvlText!: string;
    switch (level) {
      case 'request': 
        lvlText = hex(REQUEST_COLOR, '[Request]');
        break;

      case 'error':
        lvlText = hex(ERROR_COLOR, '[Error]');
        break;

      case 'info':
        lvlText = hex(INFO_COLOR, '[Info]');
        break;

      case 'warn':
        lvlText = hex(WARN_COLOR, '[Warn]');
        break;

      default:
        lvlText = hex(UNKNOWN_COLOR, '[Unknown]');
        break;
    }

    const message = this.format(...messages);
    const name = hex(NAME_COLOR, `[${this.name}]`);

    process.stdout.write(`${hex(DATE_COLOR, Util.getDate())} ${lvlText} ${name}${Padding[level.length + 2]}${message}\n`);
  }

  /**
   * Writes to the console as the INFO level
   * @param message The message
   */
  info(...message: Message[]) {
    return this.write('info', ...message);
  }

  /**
   * Writes to the console as the WARN level
   * @param message The message
   */
  warn(...message: Message[]) {
    return this.write('warn', ...message);
  }

  /**
   * Writes to the console as the ERROR level
   * @param message The message
   */
  error(...message: Message[]) {
    return this.write('error', ...message);
  }

  /**
   * Writes to the console as the REQUEST level
   * @param message The message
   */
  request(...message: Message[]) {
    return this.write('request', ...message);
  }
}
