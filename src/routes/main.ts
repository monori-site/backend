import { Route, BaseRouter, Website, Method } from '../core';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ServerResponse } from 'http';

type Reply = FastifyReply<ServerResponse>;
export default class MainRouter extends BaseRouter {
  constructor(website: Website) {
    super(website, '/');
  }

  @Route('/', { method: Method.Get })
  async main(req: FastifyRequest, res: Reply) {
    const users = this.website.database.getRepository('users');
    const user = req.session ? await users.get(req.session.username) : null;

    res.render('pages/Homepage', {
      user
    });
  }
}