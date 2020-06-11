/* eslint-disable camelcase */
import type { ServerResponse, IncomingMessage } from 'http';
import { Route, BaseRouter, Website, Method } from '../core';
import type { FastifyRequest, FastifyReply } from 'fastify';

interface IncomingQuery {
  code: string;
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

type Reply = FastifyReply<ServerResponse>;
export default class OAuth2Router extends BaseRouter {
  constructor(website: Website) {
    super(website, '/oauth2');
  }

  @Route('/', { method: Method.Get })
  async main(_: FastifyRequest, res: Reply) {
    // You're not allowed to be here, get out!
    return res.redirect('/');
  }

  @Route('/github', { method: Method.Get })
  async github(req: FastifyRequest, res: Reply) {
    if (req.session.user) return res.redirect('/');
    
    const redirectUri = this
      .website
      .config
      .github
      .callbackUrls[this.website.config.environment]
      .replace('{port}', String(this.website.config.port));

    const uri = encodeURIComponent(redirectUri);
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${this.website.config.github.clientID}&redirect_uri=${uri}&scope=${this.website.config.github.scopes.join('%20')}`);
  }

  @Route('/github/callback', { method: Method.Get })
  async githubCallback(req: FastifyRequest<IncomingMessage, IncomingQuery>, res: Reply) {
    if (req.session.user) return res.redirect('/');
    if (req.query.error && req.query.error_description) return res.render('pages/Error', {
      message: `[${req.query.error}] ${req.query.error_description}`,
      code: 500
    });

    if (!req.query.code) return res.render('pages/Error', {
      message: 'Missing "?code" query parameter',
      code: 500
    });

    const resp = await this.website.http.request({
      method: 'POST',
      // TODO: Find out if we can use forms with this
      url: `https://github.com/login/oauth/access_token?client_id=${this.website.config.github.clientID}&client_secret=${this.website.config.github.clientSecret}&code=${req.query.code}`,
      headers: {
        // Accept JSON format
        'Accept': 'application/json'
      }
    });

    try {
      const data = resp.json();
      //const users = this.website.database.getRepository('users');

      const resp2 = await this.website.http.request({
        method: 'GET',
        url: 'https://api.github.com/user',
        headers: {
          'Authorization': `token ${data.access_token}`,
          'Accept': 'application/json'
        }
      });

      const user = resp2.json<GitHubUser>();
      res.redirect('/');

      //const pkt = await users.getByGitHubId(user.id.toString()); // TODO: Make this a number also
      //if (pkt === null) return res.redirect(`/signup?github=${user.id}&token=${data.access_token}`);
      //else {
      //await users.update('set', pkt.username, {
      //github: user.id
      //});

      //req.createSession(pkt);
      //return res.redirect('/');
      //}
    } catch(ex) {
      res.render('pages/Error', {
        message: `Unable to sign in from GitHub (${ex.message})`,
        code: 500
      });
    }
  }
}