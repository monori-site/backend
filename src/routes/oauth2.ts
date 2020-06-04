import type { ServerResponse, IncomingMessage } from 'http';
import { Route, BaseRouter, Website, Method } from '../core';
import type { FastifyRequest, FastifyReply } from 'fastify';
import FormData from 'form-data';

interface IncomingQuery {
  code?: string;
}

type Reply = FastifyReply<ServerResponse>;
export default class OAuth2Router extends BaseRouter {
  constructor(website: Website) {
    super(website, '/oauth2');
  }

  // Credit: https://git.coolaj86.com/coolaj86/btoa.js
  private btoa(str: string | Buffer) {
    let buffer!: Buffer;

    if (str instanceof Buffer) {
      buffer = str;
    } else {
      buffer = Buffer.from(str.toString(), 'binary');
    }

    return buffer.toString('base64');
  }

  //#region GitHub
  @Route('/github', { method: Method.Get })
  async redirectToGithub(req: FastifyRequest, res: Reply) {
    if (req.session) return res.redirect('/');
    res.redirect(this.website.config.github.appUrl);
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

    const access = await this.website.http.request({
      method: 'POST',
      url: ''
    })
      .body(body)
      .execute();
  }
  //#endregion GitHub

  //#region Discord
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

      const data2 = res2.json();
      req
        .session!
        .set('username', `${data2.username}#${data2.discriminator}`)
        .set('avatarUrl', data2.avatar ? `https://cdn.discordapp.com/avatars/${data2.id}/${data2.avatar}.png` : null);
    
      res.redirect('/');
    } catch(ex) {
      res.render('pages/Error', {
        message: `Unable to login from Discord (${ex.message})`,
        code: 500
      });
    }
  }
  //#endregion
}