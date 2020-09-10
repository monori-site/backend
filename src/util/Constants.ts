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

import type { PermissionNodes, AnalyticFeature } from './models';
import { execSync } from 'child_process';

/** Returns the analytics timer interval */
export const Analytics = 1800000;

/** Returns the epoch for creating Snowflakes */
export const Epoch = 1593586800000; // July 1st, 2020

/** Returns the version of the backend */
export const version: string = require('../../package.json').version;

/** Returns the commit hash of this backend */
export const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).slice(0, 8).trim();

/** List of features to opt in */
export const Features: AnalyticFeature[] = ['cluster', 'database', 'gc'];

/** List of permission nodes by Array */
export const Nodes: PermissionNodes[] = [
  'remove.member',
  'manage.org',
  'delete.org',
  'add.member',
  'publish',
  'admin',
  'edit'
];

/** Object of all the months avaliable */
export const Months: { [x: number]: string } = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sept',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
};
