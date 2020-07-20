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

import { promises as fs, existsSync } from 'fs';
import { BaseRouter as Router } from '../internals';
import type { Website } from '../internals/Website';
import { Collection } from '@augu/immutable';
import { getRoutes } from '../decorators';
import { Signale } from 'signale';
import { getPath } from '../../util';
import onRequest from '../functions/onRequest';
import { join } from 'path';

export default class RoutingManager extends Collection<Router> {
  private website: Website;
  private logger: Signale;
  public path: string;

  constructor(website: Website) {
    super();

    this.website = website;
    this.logger = new Signale({ scope: 'Routing ' });
    this.path = getPath('routes');
  }

  async load() {
    const stats = await fs.lstat(this.path);
    if (!existsSync(this.path)) {
      this.logger.error(`Path "${this.path}" doesn't exist, did you remove it by accident?`);
      process.exit(1);
    }

    if (!stats.isDirectory()) {
      this.logger.error(`Path "${this.path}" was not a directory, did you modify the backend on accident?`);
      process.exit(1);
    }

    const routes = await fs.readdir(this.path);
    if (!routes.length) {
      this.logger.error(`Path "${this.path}" didn't include any routers`);
      process.exit(1);
    }

    for (const route of routes) {
      const { default: file } = await import(join(this.path, route));
      const router: Router = new file();

      if (!(router instanceof Router)) continue;

      router.init(this.website);
      const all = getRoutes(router);
      if (!all.length) continue;

      router.register(all);
      this.set(router.prefix, router);

      for (const r of all) {
        this.website.server[r.method.toLowerCase()](r.prefix, async (req, res) => onRequest.apply(this.website, [req, res, r, router]));
      }
    }
  }
}