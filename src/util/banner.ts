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

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const { version } = require('../../package.json');

const showBanner = () => {
  const path = join(process.cwd(), '..', 'assets', 'banner.txt');
  const contents = readFileSync(path, { encoding: 'utf-8' });
  const banner = contents
    .replace('$VERSION$', version)
    .replace('$COMMIT$', execSync('git rev-parse HEAD').toString().trim().slice(0, 8) ?? '... not from git ...')
    .replaceAll('$RESET$', '\x1b[0m')
    .replaceAll('$GREEN$', '\x1b[32m')
    .replaceAll('$MAGENTA$', '\x1b[95m')
    .replaceAll('$CYAN$', '\x1b[36m');

  console.log(banner);
};

export default showBanner;
