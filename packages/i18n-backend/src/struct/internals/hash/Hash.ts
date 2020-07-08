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

import { getHashes, randomBytes } from 'crypto';
import { pbkdf2Sync } from 'pbkdf2';
import { getOption } from '../../../util';

/**
 * The type of hashes from Crypto#getHashes
 */
export type Hashes = 'RSA-MD4' | 'RSA-MD5' | 'RSA-MCD2' | 'RSA-SHA1' | 'RSA-SHA1-2' | 'RSA-SHA224' | 'RSA-SHA256' |
  'RSA-SHA3-224' | 'RSA-SHA3-256' | 'RSA-SHA3-521' | 'RSA-SHA384' | 'RSA-SHA512' | 'RSA-SHA512/224' | 'RSA-SHA512/256' |
  'RSA-SM3' | 'blake2b512' | 'blake2s256' | 'id-rsassa-pkcs1-v1_5-with-sha3-224' | 'id-rsassa-pkcs1-v1_5-with-sha3-256' |
  'id-rsassa-pkcs1-v1_5-with-sha3-384' | 'id-rsassa-pkcs1-v1_5-with-sha3-512' | 'md4' | 'md4WithRSAEncryption' | 'md5' |
  'md5-sha1' | 'md5WithRSAEncryption' | 'mdc2' | 'mcd2WithRSA' | 'ripemd' | 'ripemd160' | 'ripemd160WithRSA' | 'rmd160' | 
  'sha1' | 'sha1' |'sha1WithRSAEncryption' | 'sha224' | 'sha224WithRSAEncryption' | 'sha256' | 'sha256WithRSAEncryption' |
  'sha3-224' | 'sha3-256' | 'sha3-384' | 'sha3-512' | 'sha384' | 'sha384WithRSAEncryption' | 'sha512' | 'sha512-224' |
  'sha512-224WithRSAEncryption' | 'sha512-256' | 'sha512-256WithRSAEncryption' | 'sha512WithRSAEncryption' | 'shake128' |
  'shake256' | 'sm3' | 'sm3WithRSAEncryption' |'ssl3-md5' | 'ssl3-sha1' | 'whirlpool';

export interface HashOptions {
  iterations?: number;
  length?: number;
  digest?: Hashes;
  salt?: string;
}

const hashes = getHashes();
const defaults: HashOptions = {
  iterations: 1000,
  digest: 'md5',
  length: 10,
  salt: randomBytes(16).toString('base64')
};

/**
 * Worker to convert a string to a hash that can't be easily decoded
 * @credit [Wessel Tip](https://repl.it/@PassTheWessel/PasswordHasher#Worker.js)
 */
export class HashWorker {
  /** 
   * The number of iterations to do
   */
  private iterations: number;

  /**
   * Digest type
   */
  private digest: Hashes;

  /**
   * The length of the hash
   */
  private length: number;

  /**
   * The salt token to decode it
   */
  private salt: string;

  /**
   * Creates a new HashWorker instance
   * @param options The options to use
   */
  constructor(options: HashOptions = defaults) {
    this.iterations = getOption(options, 'iterations', defaults.iterations!);
    this.digest = getOption(options, 'digest', defaults.digest!);
    this.length = getOption(options, 'length', defaults.length!);
    this.salt = getOption(options, 'salt', defaults.salt!);
  }

  /**
   * Encrypts the key
   * @param key The key to hash
   */
  encrypt(key: string) {
    if (!hashes.includes(this.digest)) throw new Error(`Digest "${this.digest}" is not a valid digest to use.`);

    const hash = pbkdf2Sync(key, this.salt, this.iterations, this.length, this.digest);
    return hash.toString('base64');
  }

  /**
   * Decrypts the key with it's hash and checks if it's right
   * @param key The key to use
   * @param hash The hash to use
   */
  check(key: string, hash: Hashes) {
    if (!hashes.includes(this.digest)) throw new Error(`Digest "${this.digest}" is not a valid digest to use.`);

    const value = pbkdf2Sync(key, this.salt, this.iterations, this.length, this.digest).toString('base64');
    return !!(value === hash); // cast it to a boolean
  }
}