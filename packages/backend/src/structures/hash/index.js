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

const { Worker } = require('snowflakey');
const SaltWorker = require('./SaltWorker');
const constants = require('../../util/Constants');

/**
 * Creates a salt hash for a password
 * @param {string} password The password
 * @param {import('./SaltWorker').WorkerOptions} opts The options
 */
const createSalt = (password, opts) => {
  const worker = new SaltWorker(opts);
  return worker.create(password);
};

/**
 * Creates a "snowflake" of a user, org, or project
 */
const createSnowflake = () => {
  const worker = new Worker({
    incrementBits: 14,
    processBits: 0,
    workerBits: 8,
    processId: process.pid,
    workerId: 28,
    epoch: constants.Epoch
  });

  const snowflake = worker.generate();
  return String(snowflake);
};

/**
 * Decodes a salt hash or a snowflake and return the contents or an Error that it wasn't found
 * @param {string} password The user's password
 * @param {string} salt The salt hash itself
 * @param {import('./SaltWorker').WorkerOptions} opts The options
 */
const decode = (password, salt, opts) => {
  const worker = new SaltWorker(opts);
  return worker.decode(password, salt);
};

module.exports = { createSnowflake, createSalt, decode };