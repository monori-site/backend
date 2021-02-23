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

import { existsSync, readFileSync } from 'fs';
import type { WebhookEvents } from './services/Webhooks';
import { join } from 'path';
import Logger from './Logger';
import yaml from 'js-yaml';

// Credit: https://github.com/getsentry/sentry-javascript/blob/master/packages/utils/src/dsn.ts#L6
const SentryDSNRegex = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+))?@)([\w.-]+)(?::(\d+))?\/(.+)/;

/**
 * Represents the `config.yml` file as a object
 */
interface Configuration {
  /**
   * DSN URL for Sentry, this is optional but recommended!
   */
  sentryDSN?: string;

  /**
   * Configuration for webhooks, like if we should enable them
   * or whatever!
   */
  webhooks?: WebhooksConfig;

  /**
   * Host to connect to instead of `localhost`
   * @default '0.0.0.0'
   */
  host?: string;

  /**
   * The port to use
   * @default 17930
   */
  port: number;

  /**
   * Configuration for SSL support
   */
  ssl?: SSLConfig;

  /**
   * Configuration for garbage collection, requires `--expose-gc` flag
   * when running Arisu
   */
  gc?: GarbageCollectorConfig;
}

interface WebhooksConfig {
  /**
   * If we should enable the service
   */
  enabled?: boolean;

  /**
   * List of events to listen for when sending
   */
  events?: (keyof typeof WebhookEvents)[];

  /**
   * The salt to hash payloads for validation
   */
  salt?: string;
}

interface SSLConfig {
  /**
   * Path to a certificate file
   */
  cert?: string;

  /**
   * Path to a private key file
   */
  key?: string;
}

interface GarbageCollectorConfig {
  /**
   * Interval to keep removing un-needed resources
   */
  interval?: string | number;

  /**
   * If the garbage collection service should be enabled
   */
  enabled?: boolean;
}

enum ConfigErrorCodes {
  /**
   * Error to indicate that result failed the regular expression
   */
  REGEX_FAILED_TO_MATCH = 'REGEX_FAILED_TO_MATCH',

  /**
   * Indication that the `config.yml` file was not found
   * in the root directory
   */
  UNABLE_TO_FIND        = 'UNABLE_TO_FIND',

  /**
   * Error to indicate that the path was not found
   */
  PATH_NOT_FOUND        = 'PATH_NOT_FOUND',

  /**
   * Error to indicate that a key is required in configuration
   */
  KEY_REQUIRED          = 'KEY_REQUIRED',

  /**
   * Indication that a invalid type or primitive was
   * not valid
   */
  INVALID_TYPE          = 'INVALID_TYPE'
}

export class ConfigError extends Error {
  constructor(code: ConfigErrorCodes, message: string) {
    super(message);

    this.name = `ConfigError [${code}]`;
  }
}

export class ConfigPropertyNotFoundError extends Error {
  constructor(property: string) {
    super(`Property '${property}' was not found in configuration`);

    this.name = 'ConfigPropertyNotFoundError';
  }
}

export default class Config {
  private static _instance: Config;
  private logger = Logger.get();
  #config!: Configuration;

  constructor() {
    if (!Config._instance)
      Config._instance = this;

    this.load();
  }

  /**
   * Returns this configuration instance
   */
  static get() {
    return this._instance;
  }

  private _validate(data: Configuration) {
    if (typeof data.port !== 'number' || (typeof data.port === 'string' && data.port !== 'auto'))
      throw new ConfigError(ConfigErrorCodes.KEY_REQUIRED, 'Property `port` is required, use "auto" to generate a random one');

    if (data.host !== undefined) {
      if (typeof data.host !== 'string')
        throw new ConfigError(ConfigErrorCodes.INVALID_TYPE, '`host` property was not a string');

      if (data.host === '0.0.0.0')
        this.logger.warn('`host` property was set to "0.0.0.0", omit `host` to remove this warning');
    }

    if (data.sentryDSN !== undefined) {
      if (typeof data.sentryDSN !== 'string')
        throw new ConfigError(ConfigErrorCodes.INVALID_TYPE, '`sentryDSN` property was not a string');

      if (!SentryDSNRegex.test(data.sentryDSN))
        throw new ConfigError(ConfigErrorCodes.REGEX_FAILED_TO_MATCH, 'Regular Expression for `sentryDSN` property failed');
    }
  }

  /**
   * Loads configuration and returns this instance
   * @throws {ConfigError} When the configuration file was unable to be validated
   * @returns {Config} Returns this instance to chain methods
   */
  load() {
    // TODO: custom path?
    const CONFIG_PATH = join(__dirname, '..', '..', 'config.yml');
    if (!existsSync(CONFIG_PATH))
      throw new ConfigError(ConfigErrorCodes.UNABLE_TO_FIND, `Unable to find config.yml in '${CONFIG_PATH}'`);

    const contents = readFileSync(CONFIG_PATH, { encoding: 'utf8' });
    const data = yaml.load(contents) as Configuration;

    // Validate the object that was serialized
    this._validate(data);

    // Add it to this instance
    this.#config = data;

    // Return this
    return this;
  }

  /**
   * Gets a property from the configuration file or throws a [ConfigPropertyNotFoundError].
   *
   * @param key The key to find (nested objects are supported, so `gc.enabled` will return the value)
   * @throws {ConfigPropertyNotFoundError} When the configuration property isn't found
   */
  get<K extends keyof Configuration>(key: K): Configuration[K];
  get<K extends keyof WebhooksConfig>(key: `webhooks.${K}`): WebhooksConfig[K];
  get<K extends keyof SSLConfig>(key: `ssl.${K}`): SSLConfig[K];
  get<K extends keyof GarbageCollectorConfig>(key: `gc.${K}`): GarbageCollectorConfig[K];
  get<K extends string>(key: K) {
    const nodes = key.split('.');
    let value: any = this.#config;

    for (const frag of nodes) {
      try {
        value = value[frag];
      } catch {
        value = null;
        break;
      }
    }

    if (value === null)
      throw new ConfigPropertyNotFoundError(key);

    return value;
  }

  /**
   * Gets a property from the configuration, if it's found return it
   * else return `null`.
   *
   * @param key The key to find (nested objects are supported, so `gc.enabled` will return the value)
   * @returns The value found or `null`
   */
  getOrNull<K extends keyof Configuration>(key: K): Configuration[K] | null;
  getOrNull<K extends keyof WebhooksConfig>(key: `webhooks.${K}`): WebhooksConfig[K] | null;
  getOrNull<K extends keyof SSLConfig>(key: `ssl.${K}`): SSLConfig[K] | null;
  getOrNull<K extends keyof GarbageCollectorConfig>(key: `gc.${K}`): GarbageCollectorConfig[K] | null;
  getOrNull(key: string) {
    try {
      return this.get(key as any);
    } catch {
      return null;
    }
  }
}
