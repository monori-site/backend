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

/** All of the permissions */
const all = {
  publish: 1 << 0,
  edit: 1 << 1,
  manage: 1 << 2,
  delete: 1 << 3
};

/**
 * Represents a utility class to handle permissions of an organisation
 * @credit https://github.com/abalabahaha/eris/blob/master/lib/structures/Permission.js
 */
module.exports = class Permissions {
  /**
   * Creates a new [Permissions] utility class
   * @param {number} allowed The allowed permissions
   * @param {number} denied The denied permissions
   * @param {number} mutual Mutual permission, will ignore
   */
  constructor(allowed, denied = 0, mutual = 0) {
    /**
     * Allowed permissions
     * @type {number}
     */
    this.allowed = allowed;

    /**
     * Denied permissins
     * @type {number}
     */
    this.denied = denied;

    /**
     * Mutual permission, most likely to ignore
     * @type {number}
     */
    this.mutual = mutual;
  }

  /**
   * Returns a JSON representation of this instance
   * @returns {{ [x: string]: boolean | 'mutual' }}
   */
  get json() {
    const obj = {};

    for (const permission of Object.keys(all)) {
      if (this.allowed & all[permission]) obj[permission] = true;
      else if (this.denied & all[permission]) obj[permission] = false;
      else if (this.mutual & all[permission]) obj[permission] = 'mutual';
    }

    return obj;
  }

  /**
   * Checks if the user has that permission
   * @param {'publish' | 'edit' | 'manage' | 'delete'} perm The permission
   */
  has(perm) {
    if (!Object.keys(all).includes(perm)) throw new TypeError(`Permission "${perm}" doesn't exist?`);
    if (this.json[perm] === 'mutual') return false;

    return !!(this.allowed & all[perm]);
  }
};