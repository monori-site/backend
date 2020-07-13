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

import type Program from './Program';

/** Represents what a command is like */
interface CommandInfo {
  /** The command's description */
  description: string;

  /** The command's external names */
  aliases?: string[];

  /** The command's usage */
  usage?: string;

  /** The name of the command */
  name: string;
}

/**
 * Represents a "CLI" command, which is a chunk of code to run when a command is received
 */
export default abstract class Command {
  /** The command's description */
  public description: string;

  /** The program's instance */
  public program!: Program;

  /** The command's external names */
  public aliases: string[];

  /** The command's usage */
  public usage: string;

  /** The name of the command */
  public name: string;

  /**
   * Creates a new Command instance
   * @param info The command's metadata
   */
  constructor(info: CommandInfo) {
    this.description = info.description;
    this.aliases = info.aliases || [];
    this.usage = info.usage || '';
    this.name = info.name;
  }

  /**
   * Initialises the command
   */
  init(program: Program) {
    this.program = program;
  }

  /**
   * Concurrently runs the command
   * @param args The arguments (if provided)
   */
  // eslint-disable-next-line
  public abstract run<T extends object>(args: T): Promise<void>;
}