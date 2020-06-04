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
  async redirectToGithub(_: FastifyRequest, res: Reply) {
    res.redirect(this.website.config.github.appUrl);
  }

  @Route('/github/callback', { method: Method.Post })
  async onCallbackGitHub(req: FastifyRequest<IncomingMessage, IncomingQuery>, res: Reply) {
    if (!req.query.hasOwnProperty('code')) return res.status(401).send({
      statusCode: 401,
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
}