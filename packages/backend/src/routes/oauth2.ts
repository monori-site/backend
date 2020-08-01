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
import { BaseRouter, Get, Post, NormalOAuthCallback, GitHubOAuth2Provider, Website, InvalidOAuthStateError, models } from '../struct';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { HttpClient } from '@augu/orchid';
import { pipelines } from '@augu/maru';

interface IncomingQuery extends NormalOAuthCallback {
  code: string;
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
  private provider: GitHubOAuth2Provider;
  private http: HttpClient = new HttpClient({
    agent: 'auguwu/i18n-backend (https://github.com/auguwu/tree/expiremental/postgres/packages/i18n-backend)'
  });

  constructor() {
    super('/oauth2');

    this.provider = new GitHubOAuth2Provider();
  }

  init(website: Website) {
    this.provider.init(website);
    return super.init(website);
  }

  @Get('/github')
  async github(req: FastifyRequest, res: FastifyReply) {
    try {
      const url = await this.provider.redirect(req.connection.remoteAddress!, 
        (redirectUrl, state) => 
          `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_url=${redirectUrl}&scope=${process.env.GITHUB_SCOPES.join('%20')}${state === undefined ? '' : `&state=${state}`}`
      );

      return res.redirect(url);
    } catch(ex) {
      return res.status(500).send({
        statusCode: 500,
        message: ex.message
      });
    }
  }

  @Post('/github/callback')
  async ghCallback(req: FastifyRequest, res: FastifyReply) {
    const query = (req.query as IncomingQuery);
    this.provider.onReceived<IncomingQuery>(query, async (error) => {
      if (error) {
        if (error instanceof InvalidOAuthStateError) {
          return res.status(403).send({
            statusCode: 403,
            message: `State "${query.state}" is invalid.`
          });
        } else {
          return res.status(500).send({
            statusCode: 500,
            message: error.message
          });
        }
      }

      const oauthReq = await this.http.request({
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        url: `https://github.com/login/oauth2/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${query.code}${query.state === undefined ? '' : `&state=${query.state}`}`
      });

      const { access_token: accessToken } = oauthReq.json();
      const userReq = await this.http.request({
        method: 'GET',
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/json'
        },
        url: 'https://api.github.com/user'
      });

      const user = userReq.json<GitHubUser>();
      const model = await this.website.connection.query<models.User>(pipelines.Select('users', ['github', user.id]), false);
    
      if (model !== null) {
        const session = await this.website.sessions.getSession(req.connection.remoteAddress!);
        await this.website.connection.query(pipelines.Update({
          values: { github: user.name },
          query: ['username', session!.username],
          type: 'set',
          table: 'users'
        }), false);

        // TODO: Get URL path from config
        return res.redirect('http://localhost:3000');
      }
    });
  }
}