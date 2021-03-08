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

/* eslint-disable camelcase */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { RegExpFailedException } from './exceptions';
import { join } from 'path';
import yaml from 'js-yaml';

const NOT_FOUND_SYMBOL = Symbol.for('$arisu::config::property_not_found');

// dsn regex for sentry (https://github.com/getsentry/sentry-javascript/blob/master/packages/utils/src/dsn.ts#L6)
const SENTRY_DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w.-]+)(?::(\d+))?\/(.+)/;

/** represents a [config.yml] file */
// camelCase doesn't work in yaml (looks weird)
export interface ConfigYaml {
  /**
   * If we should enable registrations and users must be added using the Administration Console.
   * If you are self-hosting Arisu and don't plan on adding users, disable this so you don't
   * get random people signing up.
   */
  registration?: boolean;

  /**
   * The Sentry DSN url to listen to. By default, the [Sentry] service will not
   * listen for error events and possibly report for errors in production.
   */
  sentry_dsn?: string;

  /**
   * Port to listen to for connections. To use less than 1024 as a port, run Arisu on
   * root and not on Docker. By default, it'll default to `17903` if none is specified.
   */
  port?: number;

  /**
   * Host binding to listen for connections. This will default to `0.0.0.0`
   * Use this when you know *what you're doing*!
   */
  host?: string;
}

type SnakeToCamelCase<S extends string> = S extends `${infer Start}_${infer End}`
  ? `${Start}${Capitalize<SnakeToCamelCase<End>>}`
  : `${S}`;

type Configuration = {
  [P in keyof ConfigYaml as SnakeToCamelCase<P>]: ConfigYaml[P];
};

export default class Config {
  #cached!: Configuration & Required<Pick<Configuration, 'port'>>;

  // validate the [config] for type errors and such
  private _validate(config: ConfigYaml) {
    if (config.registration !== undefined && typeof config.registration !== 'boolean')
      throw new TypeError(`[config.registration] Expected \`boolean\` but received ${typeof config.registration}`);

    if (config.sentry_dsn !== undefined) {
      if (typeof config.sentry_dsn !== 'string')
        throw new TypeError(`[config.sentry_dsn] Expected \`string\` but received ${typeof config.sentry_dsn}`);

      if (!SENTRY_DSN_REGEX.test(config.sentry_dsn))
        throw new RegExpFailedException(SENTRY_DSN_REGEX, config.sentry_dsn);
    }

    if (config.port !== undefined) {
      if (typeof config.port !== 'number')
        throw new TypeError(`[config.port] Expected \`number\` but recieved ${typeof config.port}`);

      if (Number.isNaN(config.port))
        throw new TypeError(`[config.port] Value "${config.port}" was not a number`);

      // TODO: check if on root
      if (config.port < 1024)
        throw new TypeError(`[config.port] Value "${config.port}" cannot be less than 1024`);

      if (config.port > 65535)
        throw new TypeError(`[config.port] Value "${config.port}" cannot be greater than 65535`);
    }

    if (config.host !== undefined && typeof config.host !== 'string')
      throw new TypeError(`[config.host] Expected \`string\` but received ${typeof config.host}`);
  }

  /**
   * Loads the configuration file and returns the [Configuration] object if needed.
   */
  load() {
    // If we called `Config.load` more than once, just returned the cached value
    if (this.#cached)
      return this.#cached;

    // Check if `config.yml` exists in the parent dir
    if (!existsSync(join(process.cwd(), 'config.yml')))
      throw new SyntaxError(`Missing 'config.yml' in the process directory, are you inside root? (dir: ${process.cwd()})`);

    // Load in the configuration
    const contents = readFileSync(join(process.cwd(), 'config.yml'), 'utf-8');
    const config: ConfigYaml = yaml.load(contents) as any; // cast to any

    // Validation now occurs!
    this._validate(config);

    // Cache the configuration
    this.#cached = {
      registration: config.registration,
      sentryDsn: config.sentry_dsn,
      port: config.port ?? 17903,
      host: config.host
    };

    // Return it
    return this.#cached;
  }

  /**
   * Returns the configuration value from the specified [key]. If nothing is found,
   * a {@link PropertyNotFoundException} occurs. Dot-notation is supported
   * and type-safe.
   *
   * @param key The config key to find
   */
  get<K extends keyof Configuration>(key: K): Configuration[K] | null;

  /**
   * Returns the configuration value from a specified [key], if nothing is found,
   * the [defaultValue] will be used. Dot-notation is supported
   * and type-safe.
   *
   * @param key The config key to find
   * @param defaultValue The default value to use when nothing is found
   */
  get<K extends keyof Configuration>(key: K, defaultValue: Configuration[K]): Configuration[K];
  get(key: string, defaultValue?: any) {
    const fragments = key.split('.');
    let found: any = this.#cached;

    for (let i = 0; i < fragments.length; i++) {
      try {
        found = found[fragments[i]];
      } catch {
        found = NOT_FOUND_SYMBOL;
      }
    }

    if (found === NOT_FOUND_SYMBOL) {
      if (defaultValue !== undefined)
        return defaultValue;

      return null;
    }

    return found;
  }

  /**
   * Saves the configuration object to the disk.
   */
  save() {
    const contents = yaml.dump({
      registration: this.#cached.registration,
      sentry_dsn: this.#cached.sentryDsn,
      port: this.#cached.port,
      host: this.#cached.host
    }, {
      indent: 4,
      noArrayIndent: false
    });

    writeFileSync(join(process.cwd(), 'config.yml'), contents);
  }

  /**
   * Sets a value from it's [key] into the configuration and saves to the disk.
   * @param key The key to modify
   * @param value The value to use
   */
  set<K extends keyof Configuration>(key: K, value: Configuration[K]): this;
  set(key: string, value: any) {
    this.#cached[key] = value;
    this.save();

    return this;
  }
}
