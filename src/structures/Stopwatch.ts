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

/** The status of the stopwatch */
enum Status {
  Looping    = 0,
  Ended      = 1,
  NotStarted = 2
}

/**
 * Represents a [Stopwatch], to calculate time when starting and ending it.
 * 
 * Uses [process.hrtime](https://nodejs.org/api/process.html#process_process_hrtime_time) under the hood.
 */
export class Stopwatch {
  /**
   * The starting time
   */
  public startTime?: [number, number];

  /** 
   * The status of the Stopwatch 
   */
  private _status: Status;

  /**
   * The ending time
   */
  public endTime?: [number, number];

  /**
   * Creates a new [Stopwatch] instance
   */
  constructor() {
    this._status = Status.NotStarted;
  }

  /**
   * Returns a Stringified version of [Stopwatch._status]
   */
  get status() {
    switch (this._status) {
      case Status.NotStarted: return 'not_started';
      case Status.Looping:    return 'looping';
      case Status.Ended:      return 'ended';
      default:                return 'unknown';
    }
  }

  /**
   * Starts the stopwatch
   */
  start() {
    if (this.status !== 'not_started') throw new Error(`[Stopwatch.status] is set at ${this.status}`);

    this._status   = Status.Looping;
    this.startTime = process.hrtime();
    return this;
  }

  /**
   * Ends the stopwatch
   */
  end() {
    if (this.status === 'not_started') throw new Error('Didn\'t call Stopwatch.start()');

    this._status = Status.Ended;
    this.endTime = process.hrtime(this.startTime!);

    return (this.endTime[0] * 1e9 + this.endTime[1]) / 1e6;
  }

  /**
   * Override for Object#toString
   */
  toString() {
    return `Stopwatch [${this.status}]`;
  }

  /**
   * Override for Object#[Symbol.toStringTag]
   */
  [Symbol.toStringTag]() {
    return 'Stopwatch';
  }

  /**
   * Override for Object#[Symbol.hasInstance]
   */
  static [Symbol.hasInstance](object: any) {
    return (
      typeof object === 'object' &&
      typeof object.start === 'function' &&
      typeof object.end === 'function' &&
      typeof object.constructor === 'function' &&
      /^(Stopwatch)$/.test(object[Symbol.toStringTag])
    );
  }
}
