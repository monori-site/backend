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

/** The features to opt-in when using the Analytics API */
export type AnalyticFeature = 'cluster' | 'database' | 'gc';

/** The environment used in process.env.NODE_ENV */
export type Environment = 'development' | 'production';

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

/**
 * Represents the environment config for [src/structures/Server.ts]
 */
export interface EnvConfig {
  /** The active pool connections to have concurrently (default: 3) */
  database_active_connections: number;

  /** The client secret for GitHub OAuth2 */
  github_client_secret?: string;

  /** The callback URL to use for GitHub OAuth2 */
  github_callback_url?: string;

  /** The features to opt-in for Analytics */
  analytics_features: AnalyticFeature[];

  /** The database username */
  database_username: string;

  /** The database password */
  database_password: string;

  /** The client ID for GitHub OAuth2 */
  github_client_id?: string;

  /** Password for Redis, optional */
  redis_password?: string;

  /** If we should add GitHub OAuth2 */
  github_enabled: boolean;

  /** GitHub OAuth2 scopres */
  github_scopes: string[];

  /** The database name (default: 'monori') */
  database_name: string;

  /** The database port */
  database_port: number;

  /** The database host */
  database_host: string;

  /** The database ID for Redis (default: 7) */
  redis_db_id?: number;

  /** The frontend URL of Monori (see: https://github.com/monori-site/frontend) */
  frontend_url: string;

  /** Redis port (default: 6379) */
  redis_port: number;

  /** The host of Redis (default: '127.0.0.1') */
  redis_host: string;

  /** If we should enable Analytics */
  analytics: boolean;

  /** The environment of the Backend API */
  node_env: Environment;

  /** The port to listen to */
  port: number;
}

/** The configuration for Server#config */
export interface Config {
  /** The environment */
  environment: Environment;

  /** URL for the Frontend portion */
  frontendUrl: string;

  /** Analytics config */
  analytics: AnalyticsConfig;

  /** Database config */
  database: DatabaseConfig;

  /** GitHub OAuth2 config */
  github: GitHubConfig;

  /** Redis config */
  redis: RedisConfig;
  
  /** The port */
  port: number;
}

export interface AnalyticsConfig {
  /** Features to opt-in */
  features: AnalyticFeature[];

  /** If it's enabled */
  enabled: boolean;
}

export interface DatabaseConfig {
  /** Number of active connections to have */
  activeConnections: number;

  /** The password */
  password: string;

  /** The username */
  username: string;

  /** The host */
  host: string;

  /** The port */
  port: number;

  /** The database name (default: 'monori') */
  name: string;
}

export interface GitHubConfig {
  /** The client secret (can be `undefined` if it's not enabled) */
  clientSecret?: string;

  /** The callback URL (can be `undefined` if it's not enabled) */
  callbackUrl?: string;

  /** The client ID (can be `undefined` if it's not enabled) */
  clientID?: string;

  /** If it's enabled or not */
  enabled: boolean;

  /** List of scopes to use (can be `undefined` if it's not enabled) */
  scopes?: string[];
}

export interface RedisConfig {
  /** The password to authenicating to Redis -- optional but recommended to add! */
  password?: string;

  /** The host */
  host: string;

  /** The port */
  port: number;

  /** The database ID */
  db: number;
}
