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

import { execSync } from 'child_process';

// Returns the current version of Arisu
export const version: string = require('../../package.json').version;

// Returns the commit hash from Git. If they cloned from "Download from ZIP"
// then return "unknown"
export const commitHash = (() => {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' });
    return commit.slice(0, 8).trim();
  } catch {
    return 'unknown';
  }
})();

// List of metadata keys for decorator usage
export const enum MetadataKeys {
  // Indicates a endpoint entry (class decorator)
  Endpoint = '$arisu.routing.endpoint',

  // Indicates a route to link to an endpoint (method decorator)
  Route = '$arisu.routing.route'
}
