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

import * as jwt from 'jsonwebtoken';

export enum TokenStatus {
  Invalid = 'invalid',
  Expired = 'expired',
  Unknown = 'unknown',
  Valid = 'valid'
}

interface DecodeResult {
  username?: string;
  reason?: string;
  status: TokenStatus;
}

/**
 * Represents a utility class for JWT tokens
 */
export default class JWTUtil {
  /**
   * Issues a new JWT token
   * @param username The user's username
   * @param password The user's password
   * @param salt The salt token
   */
  static issue(username: string, password: string, salt: string) {
    return jwt.sign({ username, password }, salt, { algorithm: 'HS512', expiresIn: '7 days' });
  }

  /**
   * Decodes the token to see if it's valid
   * @param token The access token
   * @param salt The salt token
   */
  static decode(token: string, salt: string): DecodeResult {
    try {
      const value = jwt.verify(token, salt, { algorithms: ['HS512'] });
      if (typeof value === 'string') return {
        status: TokenStatus.Invalid,
        reason: 'Result wasn\'t an object'
      };

      return {
        username: (value as any).username,
        status: TokenStatus.Valid
      };
    } catch(ex) {
      if (ex instanceof jwt.JsonWebTokenError) return { status: TokenStatus.Invalid, reason: 'Token is invalid.' };
      if (ex instanceof jwt.TokenExpiredError) return { status: TokenStatus.Expired, reason: 'Token has expired, re-evaluate a new one.' };
      return {
        status: TokenStatus.Unknown,
        reason: ex.message
      };
    }
  }
}