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

import { Component, Inject } from '@augu/lilith';
import { readFileSync } from 'fs';
import { Logger } from 'tslog';
import { join } from 'path';
import yaml from 'js-yaml';

interface ConfigDetails {
  defaultLocale?: string;
  prometheus?: PrometheusConfig;
  environment: 'development' | 'production';
  sentry_dsn?: string;
  database: DatabaseConfig;
  host?: string;
  k8s?: KubernetesConfig;
}

interface DatabaseConfig {
  run_pending_migrations?: boolean;
  database: string;
  password: string;
  username: string;
  port: number;
  host: string;
  url?: string;
}

// eslint-disable-next-line
interface RedisSentinelConfig extends Pick<RedisConfig, 'host' | 'port'> {}
interface RedisConfig {
  sentinels?: RedisSentinelConfig[];
  password?: string;
  index?: number;
  host: string;
  port: number;
}

interface KubernetesConfig {
  namespace: string;
}

interface PrometheusConfig {
  port: number;
}

type SnakeToCamelCase<K extends string> = K extends `${infer A}_${infer B}` ? `${A}${Capitalize<B>}` : K;
type Configuration = {
  [K in keyof ConfigDetails as SnakeToCamelCase<K>]: ConfigDetails[K];
}

@Component({
  priority: 0,
  name: 'config'
})
export default class Config {
  #config!: Configuration;

  @Inject
  private logger!: Logger;

  load() {
    this.logger.info('config >> loading...');

    const path = join(process.cwd(), '..', 'config.yml');
    const contents = readFileSync(path, { encoding: 'utf8' });
    const config = yaml.load(contents) as unknown as Configuration;

    this.logger.info('config >> loaded.');
    this.#config = config;
  }

  get<K extends keyof Configuration>(key: K): Configuration[K] {
    if (!this.#config.hasOwnProperty(key))
      throw new TypeError(`config: key ${key} was not found.`);

    return this.#config[key];
  }
}
