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

import { BaseRouter, Get, Post, GitHubConfig } from '../struct';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes } from 'crypto';
import { HttpClient } from '@augu/orchid';
import { pipelines } from '@augu/maru';
import { Queue } from '@augu/immutable';

interface IncomingQuery {
  code: string;
  state: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_url: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: 'User'; // TODO: Find all types
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  hireable: boolean;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authenication: boolean;
  plan: UserPlan;
}

interface UserPlan {
  name: string;
  space: number;
  private_repos: number;
  collaborators: number;
}

export default class OAuth2Router extends BaseRouter {
  private states: Queue<string> = new Queue();
  private http: HttpClient = new HttpClient({
    agent: 'auguwu/i18n-backend (https://github.com/auguwu/tree/expiremental/postgres/packages/i18n-backend)'
  });

  constructor() {
    super('/oauth2');
  }

  @Get('/github')
  async github(req: FastifyRequest, res: FastifyReply) {
    if (await this.website.sessions.exists(req.connection.remoteAddress!)) return res.status(500).send({
      statusCode: 500,
      message: 'Address has an concurrent session, continue'
    });

    const config = this.website.config.get<GitHubConfig>('github');
    const env = this.website.config.get<string>('environment', 'development');

    if (config === null || !config!.callbackUrls.hasOwnProperty(env)) return res.status(500).send({
      statusCode: 500,
      message: config === null ? 'GitHub OAuth2 is not enabled.' : `Environment "${env}" is not supported in GitHub OAuth2 callback urls`
    });

    const redirectUri = config.callbackUrls[env].replace('{port}', String(this.website.config.get('port')!));
    const state = randomBytes(4).toString('hex');
    this.states.add(state);

    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${config.clientID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${config.scopes.join('%20')}&state=${state}`);
  }

  @Post('/github/callback')
  async ghCallback(req: FastifyRequest, res: FastifyReply) {
    if (await this.website.sessions.exists(req.connection.remoteAddress!)) return res.status(500).send({
      statusCode: 500,
      message: 'Address has an concurrent session, continue'
    });

    const query = (req.query as IncomingQuery);
    if (!query.code || !query.state) return res.status(500).send({
      statusCode: 500,
      message: 'Missing ?code or ?state query parameter'
    });
    
    if (query.error && query.error_description) return res.status(403).send({
      statusCode: 403,
      message: `[${query.error}] ${query.error_description}`
    });

    if (!this.states.includes(query.state)) return res.status(401).send({
      statusCode: 401,
      message: 'State was not valid, not continuing'
    });

    const config = this.website.config.get<GitHubConfig>('github');
    const env = this.website.config.get<string>('environment', 'development');

    if (config === null || !config!.callbackUrls.hasOwnProperty(env)) return res.status(500).send({
      statusCode: 500,
      message: config === null ? 'GitHub OAuth2 is not enabled.' : `Environment "${env}" is not supported in GitHub OAuth2 callback urls`
    });

    try {
      const oauth2 = await this.http.request({
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        url: `https://github.com/login/oauth2/access_token?client_id=${config.clientID}&client_secret=${config.clientSecret}&code=${query.code}&state=${query.state}`
      });

      const data = oauth2.json();
      const resp2 = await this.http.request({
        method: 'GET',
        url: 'https://api.github.com/user',
        headers: {
          'Authorization': `token ${data.access_token}`,
          'Accept': 'application/json'
        }
      });

      const user = resp2.json<GitHubUser>();
      console.log(user);

      const transaction = this.website.connection.createBatch();
      transaction
        .pipe(pipelines.Select('users', ['github', user.id]));

      const result = await transaction.next<any>();
      console.log(result);

      return res.status(200).send({
        statusCode: 200,
        message: 'Successfully logged in with GitHub'
      });
    } catch (ex) {
      res.status(500).send({
        statusCode: 500,
        message: 'Unable to fufill request',
        error: `[${ex.name}] ${ex.message}`
      });
    }
  }
}