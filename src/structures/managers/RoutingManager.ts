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

import type { Server, Route as IRoute } from '..';
import { promises as fs } from 'fs';
import { Logger } from '../Logger';
import { join } from 'path';
import Util from '../../util';

export default class RoutingManager {
  private server: Server;
  private logger: Logger;
  private path: string;

  constructor(server: Server) {
    this.server = server;
    this.logger = new Logger();
    this.path   = Util.getPath('routers');
  }

  async load() {
    const stats = await fs.lstat(this.path);
    if (!stats.isDirectory()) {
      this.logger.error(`Path "${this.path}" was not a directory, did you clone a wrong/broken commit?`);
      return;
    }

    const files = await fs.readdir(this.path);
    if (!files.length) {
      this.logger.error(`Path "${this.path}" didn't include any files, did you clone a broken commit?`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { default: route }: { default: IRoute } = await import(join(this.path, file));

      if (typeof route !== 'object') {
        this.logger.error(`Corrupt Install -- Path "${join(this.path, file)}" is not an instance of IRoute`);
        continue;
      }

      this.server.app.use(`/${route.path}`, route.router);
    }
  }
}
