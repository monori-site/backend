/* eslint-disable camelcase */
import type { ServerResponse, IncomingMessage } from 'http';
import { Route, BaseRouter, Website, Method } from '../core';
import type { FastifyRequest, FastifyReply } from 'fastify';
import FormData from 'form-data';

interface IncomingQuery {
  code?: string;
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

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string;

  // Why are these non-optional while email and other stuff are
  // Because, we use the `identify` scope which returns these
  flags: number;
  premium_type: number;
  public_flags: number;
}

type Reply = FastifyReply<ServerResponse>;
export default class OAuth2Router extends BaseRouter {
  constructor(website: Website) {
    super(website, '/oauth2');
  }

  @Route('/github', { method: Method.Get })
  async redirectToGithub(req: FastifyRequest, res: Reply) {
    if (req.session) return res.redirect('/');
    
    const redirectUri = this.website.config.github.callbackUrls[this.website.config.environment];
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${this.website.config.github.clientID}&redirect_uri=${redirectUri}&scope=${this.website.config.github.scopes.join('%20')}`);
  }

  @Route('/github/callback', { method: Method.Post })
  async onCallbackGitHub(req: FastifyRequest<IncomingMessage, IncomingQuery>, res: Reply) {
    if (req.session) return res.redirect('/');
    if (!req.query.hasOwnProperty('code')) return res.status(500).send({
      statusCode: 500,
      message: 'No `?code` was provided.'
    });

    const body = new FormData();
    body.append('client_id', this.website.config.github.clientID);
    body.append('client_secret', this.website.config.github.clientSecret);
    body.append('redirect_uri', this.website.config.github.callbackUrls[this.website.config.environment]);
    body.append('code', req.query.code);

    const resp = await this.website.http.request({
      method: 'POST',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        'Accept': 'application/json'
      }
    })
      .body(body)
      .execute();

    try {
      const data = resp.json();
      const users = this.website.database.getRepository('users');

      const resp2 = await this.website.http.request({
        method: 'GET',
        url: 'https://api.github.com/user',
        headers: {
          'Authorization': `token ${data.access_token}`,
          'Accept': 'application/json'
        }
      }).execute();

      const user = resp2.json<GitHubUser>();
      const pkt = await users.getByGitHubId(user.id.toString()); // TODO: Make this a number also
      if (pkt === null) return res.redirect(`/signup?github=${user.id}&token=${data.access_token}`);
      else {
        await users.update('set', pkt.username, {
          github: user.id
        });

        req.createSession(pkt);
        return res.redirect('/');
      }
    } catch(ex) {
      res.render('pages/Error', {
        message: `Unable to sign in from GitHub (${ex.message})`,
        code: 500
      });
    }
  }

  @Route('/discord', { method: Method.Get })
  async onDiscord(req: FastifyRequest, res: Reply) {
    if (req.session) return res.redirect('/');

    const redirectUri = this.website.config.discord.callbackUrls[this.website.config.environment];
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${this.website.config.discord.clientID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${this.website.config.discord.scopes.join('%20')}`);
  }

  @Route('/discord/callback', { method: Method.Post })
  async onDiscordCallback(req: FastifyRequest<IncomingMessage, IncomingQuery>, res: Reply) {
    if (req.session) return res.redirect('/');
    if (!req.query.hasOwnProperty('code')) return res.status(500).send({
      statusCode: 500,
      message: 'Missing code query'
    });

    const body = new FormData();
    body.append('client_id', this.website.config.discord.clientID);
    body.append('client_secret', this.website.config.discord.clientSecret);
    body.append('grant_type', 'authorization_code');
    body.append('redirect_uri', this.website.config.discord.callbackUrls[this.website.config.environment]);
    body.append('scope', this.website.config.discord.scopes.join(' '));
    body.append('code', req.query.code);

    const resp = await this
      .website
      .http
      .request({
        method: 'POST',
        url: 'https://discordapp.com/api/oauth2/token'
      })
      .body(body)
      .execute();

    try {
      const data = resp.json();
      const res2 = await this
        .website
        .http
        .request({
          method: 'GET',
          url: 'https://discordapp.com/api/users/@me',
          headers: {
            Authorization: `${data.token_type} ${data.access_token}`
          }
        }).execute();

      const data2 = res2.json<DiscordUser>();
      const users = this.website.database.getRepository('users');
      const pkt = await users.getByDiscordId(data2.id);

      if (pkt === null) return res.redirect(`/signup?discord=${data2.id}&token=${data.access_token}`);
      else {
        await users.update('set', pkt.username, {
          discord: data2.id
        });

        req.createSession(pkt);
        return res.redirect('/');
      }
    } catch(ex) {
      res.render('pages/Error', {
        message: `Unable to login from Discord (${ex.message})`,
        code: 500
      });
    }
  }
}