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

/**
 * Type alias of a function with additional arguments
 */
type Listener = (...args: any[]) => void;

/**
 * Type alias for typeparam `T` in EventBus
 */
type EventBusMap = { [x in string | symbol]: Listener };

/**
 * Represents an "event bus" basically an typed instance of NodeJS.EventEmitter
 */
export class EventBus<T extends EventBusMap = EventBusMap> {
  /**
   * A list of events
   */
  private events: { [x in keyof T]?: Listener[] };

  /**
   * Creates a new EventBus
   */
  constructor() {
    this.events = {};
  }

  /**
   * Emits an event
   * @param event The event to emit
   * @param args Any additional arguments
   * @returns Boolean if it was found or not
   */
  emit(event: keyof T, ...args: any[]) {
    if (!(event in this.events)) return false;

    const listeners = this.events[event]!;
    for (const listener of listeners) listener(...args);

    return true;
  }

  /**
   * Pushes an event to the callstack until it is emitted
   * @param event The event to register
   * @param listener The listener
   * @returns This instance to chain methods
   */
  on(event: keyof T, listener: T[keyof T]) {
    if (this.events[event]) this.events[event]!.push(listener);
    else this.events[event] = [listener];

    return this;
  }

  /**
   * Pushes this event and removes it after it's emitted
   * @param event The event to register
   * @param listener The listener
   * @returns This instance to chain methods
   */
  once(event: keyof T, listener: T[keyof T]) {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.remove(event, onceListener as any);
    };

    if (this.events[event]) {
      this.events[event]!.push(onceListener);
    } else {
      this.events[event] = [onceListener];
    }

    return this;
  }

  /**
   * Removes this event from the callstack
   * @param event The event
   * @param listener The listener to remove
   */
  remove(event: keyof T, listener: T[keyof T]) {
    if (!this.events[event]) return false;

    const listeners = this.events[event]!;
    if (!listeners.length) return false;

    for (let i = listeners.length; i > 0; i--) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        break;
      }
    }

    if (!listeners.length) {
      delete this.events[event];
    } else {
      this.events[event] = listeners;
    }

    return true;
  }

  /**
   * Returns the size of listeners in all events
   */
  size(): number;

  /**
   * Returns the size of listeners in this event
   * @param event The event to find
   */
  size(event: string): number;

  /**
   * Returns the size of listeners in this event
   * @param event The event to find
   */
  size(event?: string) {
    if (event) {
      if (!this.events[event]) return 0;
      return this.events[event]!.length;
    } else {
      return Object.keys(this.events).length;
    }
  }
}