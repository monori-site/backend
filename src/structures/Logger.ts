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

import { wrapCallSite } from 'source-map-support';
import { basename } from 'path';
import { inspect } from 'util';
import * as utils from '@augu/utils';
import * as leeks from 'leeks.js';

const colors = Object.keys(leeks.colors);
const styles = Object.keys(leeks.styles);
const callsitesSym = Symbol('callsites');

/**
 * Format text to support color / style matches using `{<style>}`.
 * @param text The text to format
 * @returns The replaced format with colours or styles
 */
export function format(text: string) {
  for (const style of styles)
    text = text.replaceAll(new RegExp(`{${style}}`, 'g'), (replace) => leeks.styles[style](replace));

  for (const color of colors)
    text = text.replaceAll(new RegExp(`{${color}}`, 'g'), (replace) => leeks.colors[color](replace));

  return text;
}

/**
 * Format a list of messages to a proper format
 * @param messages A list of messages to format
 */
export function formatMessages(...messages: LogMessage[]) {
  return messages.map(text => {
    if (text instanceof Date) return leeks.colors.gray(text.toISOString());
    if (text === undefined) return leeks.colors.gray('undefined');
    if (text === null) return leeks.colors.gray('null');

    if (typeof text === 'function')
      return leeks.colors.magenta(`[function ${text.name}]`);

    if (text instanceof Error) {
      const name = leeks.colors.bgRed(`   ${text.name}   `);
      const message = leeks.colors.gray(`~ ${text.message}`);

      const trace = [`${name}${message}`];
      trace.push(
        //`   • ${filename ?? '<anonymous>'}:${callsite.getLineNumber()}:${callsite.getColumnNumber()}`
      );

      return trace.join('\n');
    }

    if (typeof text === 'object') return inspect(text, { depth: null, showHidden: false, showProxy: true });

    return text;
  }).join('\n');
}

// get all call sites and return it
function _getAllCallSites(error?: Error): NodeJS.CallSite[] | undefined {
  const origPrepare = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, trace) => trace;

  const stack: any = (error ?? new Error()).stack?.slice(1);
  Error.prepareStackTrace = origPrepare;

  return stack;
}

// type of messages we can pass in
type LogMessage = string | object | any[] | Date | Error | null | undefined;

// levels to log
export const enum LogLevel {
  Trace = 'trace', // send where the log function was called in
  Debug = 'debug', // log debug information in `dev` environment
  Error = 'error', // any errors to append
  Warn  = 'warn',  // list of warnings (i.e deprecated functions, etc)
  Info  = 'info'   // informational messages
}

// definition of a [NodeJS.CallSite] from `wrapCallSite` (source-map-support)
interface WrappedCallSite extends NodeJS.CallSite {
  ['constructor']: NodeJS.CallSite;

  getScriptNameOrSourceURL(): string;
  getPromiseIndex(): number | null;
  isPromiseAll(): boolean;
  getPosition(): number;
  isAsync(): boolean;
}

export default class Logger {
  // (private) write a message to the console with a specific [level].
  // level [arisu.structures.LogLevel]: the log level to use
  // messages: [RestArray<arisu.structures.LogMessage>]: the messages to print out
  private write(level: LogLevel, ...messages: LogMessage[]) {
    // used for trace and retrieving the file name
    const stacktrace = _getAllCallSites() as WrappedCallSite[] | undefined;

    // format messages
    const message = formatMessages(...messages);
    const date = utils.formatDate();

    // check if it's an error
    if (level === LogLevel.Error) {
      const { raw: error, frames } = (messages.filter(msg => msg instanceof Error) as Error[])
        .map(error => ({
          frames: _getAllCallSites(error),
          raw: error
        }))
        .map(site => ({
          frames: site.frames?.map<WrappedCallSite>(wrapCallSite) ?? [],
          raw: site.raw
        }))
        .flat()[0];

      // idk how to make it any better so h
      const errorName = leeks.colors.bgMagenta(`   ${leeks.colors.gray(leeks.styles.bold(error.name))}${leeks.colors.bgMagenta('   ')}`);
      const errMessage = leeks.colors.gray(`~ ${error.message}`);
      //const codeframe = this.getCodeFrame(error, frames);
    }

    // check if it's trace
    if (level === LogLevel.Trace) {
      const { raw: error, frames } = (messages.filter(msg => msg instanceof Error) as Error[])
        .map(error => ({
          frames: _getAllCallSites(error),
          raw: error
        }))
        .map(site => ({
          frames: site.frames?.map<WrappedCallSite>(wrapCallSite) ?? [],
          raw: site.raw
        }))
        .flat()[0];

      // idk how to make it any better so h
      const errorName = leeks.colors.bgMagenta(`   ${leeks.colors.gray(leeks.styles.bold(error.name))}${leeks.colors.bgMagenta('   ')}`);
      const errMessage = leeks.colors.gray(`~ ${error.message}`);

      // print ig
    }

    const trace = stacktrace![0];
  }
}
