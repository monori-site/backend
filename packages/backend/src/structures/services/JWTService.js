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

const JWT = require('jsonwebtoken');

/** Enum object of all the possible statuses */
const TokenStatus = {
  Invalid: 'invalid',
  Expired: 'expired',
  Valid: 'valid'
};

/**
 * Represents a service-class of a JWT service, which handles
 * all user access tokens (to modify the account's content, etc)
 */
module.exports = class JWTService {
  /**
   * Creates a new [JWTService] instance
   * @param {string} secret The secret
   */
  constructor(secret) {
    /**
     * The secret
     * @type {string}
     * @private
     */
    this.secret = secret;
  }

  /**
   * Issues out a new access token
   * @param {string} userID The user's username
   */
  issue(userID) {
    return JWT.sign(userID, this.secret, {
      algorithm: 'HS512',
      expiresIn: '7 days'
    });
  }

  /**
   * Decodes the token and returns a result
   * @param {string} token The token itself
   * @returns {DecodeResult} The result
   */
  decode(token) {
    try {
      const value = JWT.verify(token, this.secret, { algorithms: ['HS512'] });
      if (typeof value === 'object') return { status: TokenStatus.Invalid, reason: 'Result returned an object, not the user ID' };

      return { userID: value, status: 'valid' };
    } catch(ex) {
      if (ex instanceof JWT.JsonWebTokenError) return { status: TokenStatus.Invalid, reason: 'Token is invalid' };
      else if (ex instanceof JWT.TokenExpiredError) return { status: TokenStatus.Expired, reason: 'Token has expired, please re-evaluate' };
      else return {
        status: TokenStatus.Invalid,
        reason: ex.message
      };
    }
  }
};

/**
 * @typedef {object} DecodeResult
 * @prop {string} [reason] The reason it wasn't validated
 * @prop {string} [userID] The user's ID
 * @prop {'invalid' | 'expired' | 'valid'} status The status
 */