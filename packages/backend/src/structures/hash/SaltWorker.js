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

const { getHashes, randomBytes } = require('crypto');
const { pbkdf2Sync } = require('pbkdf2');
const { getOption } = require('../../util');

const hashes = getHashes();

/** @type {WorkerOptions} */
const defaults = {
  iterations: 1000,
  length: 10,
  digest: 'md5',
  salt: randomBytes(8).toString('hex') // length: 16
};

/**
 * Worker for creating salt-based tokens
 * @credit https://repl.it/@PassTheWessel/PasswordHasher#Worker.js
 */
module.exports = class SaltWorker {
  /**
   * Creates a new [SaltWorker] instance
   * @param {WorkerOptions} [opts] The options itself
   */
  constructor(opts = defaults) {
    /**
     * Amount of iterations to do
     * @type {number}
     */
    this.iterations = opts.hasOwnProperty('iterations') ? opts.iterations : defaults.iterations;

    /**
     * Digest method
     * @type {Hashes}
     */
    this.digest = opts.hasOwnProperty('digest') ? opts.digest : defaults.digest;

    /**
     * Length of the salt
     * @type {number}
     */
    this.length = opts.hasOwnProperty('length') ? opts.length : defaults.length;

    /**
     * Token itself
     * @type {string}
     */
    this.salt = opts.hasOwnProperty('salt') ? opts.salt : defaults.salt;
  }

  /**
   * Creates a salt token
   * @param {string} password The password
   */
  create(password) {
    if (!hashes.includes(this.digest)) throw new TypeError(`Digest method "${this.digest}" is not a valid method to use.`);

    const hash = pbkdf2Sync(password, this.salt, this.iterations, this.length, this.digest);
    return hash.toString('base64');
  }

  /**
   * Decrypts the password to see if it exists
   * @param {string} password The password
   * @param {string} salt The salt itself
   */
  decode(password, salt) {
    if (!hashes.includes(this.digest)) throw new TypeError(`Digest method "${this.digest}" is not a valid method to use.`);

    const hash = pbkdf2Sync(password, salt, this.iterations, this.length, this.digest);
    return Boolean(hash.toString('base64') === salt);
  }
};

/**
 * @typedef {'RSA-MD4' | 'RSA-MD5' | 'RSA-MCD2' | 'RSA-SHA1' | 'RSA-SHA1-2' | 'RSA-SHA224' | 'RSA-SHA256' | 'RSA-SHA3-224' | 'RSA-SHA3-256' | 'RSA-SHA3-521' | 'RSA-SHA384' | 'RSA-SHA512' | 'RSA-SHA512/224' | 'RSA-SHA512/256' | 'RSA-SM3' | 'blake2b512' | 'blake2s256' | 'id-rsassa-pkcs1-v1_5-with-sha3-224' | 'id-rsassa-pkcs1-v1_5-with-sha3-256' | 'id-rsassa-pkcs1-v1_5-with-sha3-384' | 'id-rsassa-pkcs1-v1_5-with-sha3-512' | 'md4' | 'md4WithRSAEncryption' | 'md5' | 'md5-sha1' | 'md5WithRSAEncryption' | 'mdc2' | 'mcd2WithRSA' | 'ripemd' | 'ripemd160' | 'ripemd160WithRSA' | 'rmd160' |  'sha1' | 'sha1' |'sha1WithRSAEncryption' | 'sha224' | 'sha224WithRSAEncryption' | 'sha256' | 'sha256WithRSAEncryption' | 'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512' | 'sha384' | 'sha384WithRSAEncryption' | 'sha512' | 'sha512-224' | 'sha512-224WithRSAEncryption' | 'sha512-256' | 'sha512-256WithRSAEncryption' | 'sha512WithRSAEncryption' | 'shake128' | 'shake256' | 'sm3' | 'sm3WithRSAEncryption' |'ssl3-md5' | 'ssl3-sha1' | 'whirlpool'} Hashes
 * @typedef {object} WorkerOptions
 * @prop {number} [iterations=1000] Amount of iterations to do
 * @prop {number} [length=10] The length of the token
 * @prop {Hashes} [digest='md5'] The digest type
 * @prop {string} [salt] Small token 
 */