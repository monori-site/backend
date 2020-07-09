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

import type { RedisOptions as RedisConfig } from 'ioredis';
import * as util from '../../util';

/** Represents what the `config.json` file should be like */
export interface Configuration {
  /** The environment of the application */
  environment: 'development' | 'production';

  /** If we should do analytics (requests and such) */
  analytics: boolean;

  /** Database config */
  database: DatabaseConfig;

  /** Configuration for GitHub OAuth2 */
  github: GitHubConfig;

  /** The secret to use */
  secret: string;

  /** Configuration for Redis */
  redis: RedisConfig;

  /** Custom color for the embed */
  color: string;

  /** The port to the server */
  port: number;
}

/** Represents config details for GitHub OAuth2 (disabled if not defined) */
interface GitHubConfig {
  callbackUrls: { [x in 'development' | 'production']: string }
  clientSecret: string;
  clientID: string;
  scopes: string[];
}

/** Represents config details for PostgreSQL */
interface DatabaseConfig {
  username: string;
  password: string;
  name: string;
  host: string;
  port: number;
}

/**
 * Represents the manager for the configuration
 */
export default class ConfigManager {
  /** Cache of the configuration */
  private cache: Configuration;

  /**
   * Creates a new instance of ConfigManager
   */
  constructor() {
    this.cache = this.load();
  }

  /**
   * Loads the configuration
   */
  load() {
    const path = util.getPath('config.json');
    try {
      return JSON.parse<Configuration>(require(path));
    } catch {
      throw new Error(`Unable to find config in path "${path}"`);
    }
  }

  /**
   * Gets a value from the config or `null` if it's not found
   * @param section The section to get
   */
  get<T>(section: string): T | null;

  /**
   * Gets a value from the config or uses the default value provided
   * @param section The section to get
   * @param defaultValue The default value if it's not found
   */
  get<T>(section: string, defaultValue: T): T;

  /**
   * Gets a value from the config or uses the default value provided
   * @param section The section to get
   * @param defaultValue The default value if it's not found
   */
  get<T>(section: string, defaultValue?: T) {
    const nodes = section.split('.');
    let cache: any = this.cache;

    for (const node of nodes) {
      try {
        cache = cache[node];
      } catch {
        cache = null;
        break;
      }
    }
    
    if (cache != null) return cache;
    else if (cache === null && defaultValue!= undefined) return defaultValue;
    else return null;
  }
}