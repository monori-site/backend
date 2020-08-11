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

const SnowflakeWorker = require('./SnowflakeWorker');
const SaltWorker = require('./SaltWorker');

/**
 * Creates a salt hash for a password
 * @param {string} password The password
 * @param {import('./SaltWorker').Options} opts The options
 */
const createSalt = (password, opts) => {
  const worker = new SaltWorker(password, opts);
  return worker.create();
};

/**
 * Creates a "snowflake" of a user, org, or project
 * @param {string} content The content to push to this Snowflake
 */
const createSnowflake = (content) => {
  const worker = new SnowflakeWorker();
  return worker.create(content);
};

/**
 * Decodes a salt hash or a snowflake and return the contents or an Error that it wasn't found
 * @param {'salt' | 'snowflake'} type The type to use
 * @param {string} content The content to validate
 * @param {import('./SaltWorker').Options} [opts] The options (only neded for the salt worker)
 */
const decode = (type, content, opts) => {
  switch (type) {
    case 'snowflake': {
      if (opts !== undefined) throw new TypeError('`opts` shouldn\'t exist in the Snowflake worker');

      const worker = new SnowflakeWorker();
      return worker.decode(content);
    }

    case 'salt': {
      const worker = new SaltWorker(content, opts);
      return worker.decode();
    }

    default: throw new SyntaxError(`Expecting 'salt' or 'snowflake', received ${type}.`);
  }
};

module.exports = { createSnowflake, createSalt, decode };