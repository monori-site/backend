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

/* eslint-disable camelcase */

/** The permission nodes */
export type PermissionNodes = 'manage.org' | 'delete.org' | 'add.member' | 'remove.member' | 'publish' | 'edit'  | 'admin';

/**
 * Represents a User account
 */
export interface User {
  /** The organisations the user has made, mapped by their ID */
  organisations: string[];

  /** If they contributed to any project */
  contributor: boolean;

  /** The user's description */
  description: string;

  /** The date the user was created */
  created_at: Date;

  /** If they made a translation project in a user/org account */
  translator: boolean;

  /** The projects the user has made, mapped by their ID */
  projects: string[];

  /** The user's username */
  username: string;

  /** The raw password */
  password: string;

  /** The user's avatar URL by path or Gravatar URL */
  avatar: string;

  /** The user's GitHub username */
  github: string | null;

  /** If they are an administrator or not */
  admin: boolean;

  /** The user's email address */
  email: string;

  /** The salt to password checking */
  salt: string;

  /** The user's ID */
  id: string;
}

/**
 * Represents an organisation, like a user account but 
 */
export interface Organisation {
  /** Object of permissions keyed by the member's ID and the allowed permission node */
  permissions: {
    [memberID: string]: {
      [node in PermissionNodes]: 'false' | 'true';
    }
  };

  /** Date when the organisation was created at */
  created_at: Date;

  /** The projects mapped by the ID */
  projects: string[];

  /** The members of the organsiation mapped by their ID */
  members: string[];

  /** The organsiation's website */
  website: string;

  /** The organsiation's GitHub username */
  github: string | null;

  /** The owner's ID */
  owner: string;

  /** The organisation's name */
  name: string;

  /** The organisation's ID */
  id: string;
}

/**
 * Represents a Project, which is basically a structure for translations
 */
export interface Project {
  /** The translations object; keyed as the translation code and the GitHub URL/file path */
  translations: {
    [x: string]: string;
  };

  /** The completed translations object; keyed as the translation code and valued as the percentage */
  completed: {
    [x: string]: string;
  };

  /** The project's description */
  description: string;

  /** The GitHub project URL */
  github: string | null;

  /** The owner of the project */
  owner: string;

  /** The type of project */
  type: 'org' | 'user';

  /** The project's name */
  name: string;

  /** The project's ID */
  id: string;
}
