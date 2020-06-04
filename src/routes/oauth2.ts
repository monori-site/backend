import { Route, BaseRouter, Website, Method } from '../core';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ServerResponse } from 'http';
import FormData from 'form-data';

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
  async onGitHub(_: FastifyRequest, res: Reply) {
    res.redirect(this.website.config.github.appUrl);
  }
}