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

import { Repository } from '../internals/Repository';

interface User {
  organisations: string[];
  contributor: boolean;
  translator: boolean;
  password: string;
  username: string;
  github: string | null;
  email: string;
  admin: boolean;
  id: string;
}

export default class UserRepository extends Repository<User> {
  constructor() {
    super({
      columns: [
        {
          nullable: false,
          primary: false,
          array: true,
          name: 'organisations',
          type: 'string'
        },
        {
          nullable: false,
          primary: false,
          array: false,
          name: 'contributor',
          type: 'boolean'
        },
        {
          nullable: false,
          primary: false,
          array: false,
          name: 'translator',
          type: 'boolean'
        },
        {
          nullable: false,
          primary: false,
          array: false,
          name: 'password',
          type: 'string'
        },
        {
          nullable: false,
          primary: false,
          array: false,
          name: 'username',
          type: 'string'
        },
        {
          nullable: true,
          primary: false,
          array: false,
          name: 'github',
          type: 'string'
        },
        {
          nullable: false,
          primary: false,
          array: false,
          name: 'email',
          type: 'string'
        },
        {
          nullable: false,
          primary: false,
          array: false,
          name: 'admin',
          type: 'boolean'
        },
        {
          nullable: false,
          primary: true,
          array: false,
          name: 'id',
          type: 'string'
        }
      ],
      table: 'users'
    });
  }

  getByGitHub(userID: string) {
    return this.website.database.query<User>(`SELECT * FROM ${this.table} WHERE github = '${userID}';`);
  }
}