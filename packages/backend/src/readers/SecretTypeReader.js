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

const { TypeReader } = require('@augu/dotenv');

/**
 * Represents a [SecretTypeReader], validates if a string
 * is a secret string
 * 
 * @extends {TypeReader<string>}
 */
module.exports = class SecretTypeReader extends TypeReader {
  /**
   * Creates a new [SecretTypeReader] instance
   */
  constructor() {
    super('secret');
  }

  /**
   * Validates this type reader
   * @param {string} arg The argument
   */
  validate(arg) {
    if (arg.length < 32) return false;
    return true;
  }

  /**
   * Returns the secret (if it was validated)
   * @param {string} arg The argument
   */
  parse(arg) {
    return arg;
  }
};