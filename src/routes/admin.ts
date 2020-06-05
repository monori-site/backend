import { Route, BaseRouter, Website, Method } from '../core';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ServerResponse } from 'http';

type Reply = FastifyReply<ServerResponse>;
export default class AdminRouter extends BaseRouter {
  constructor(website: Website) {
    super(website, '/admin');
  }

  @Route('/', { method: Method.Get, admin: true })
  async main(_: FastifyRequest, res: Reply) {
    const organisations = this.website.database.getRepository('organisations');
    const projects = this.website.database.getRepository('projects');
    const users = this.website.database.getRepository('users');

    res.render('pages/admin/Home', {
      requests: {
        minute: this.website.analytics.enabled ? this.website.analytics.getRequestsPerMinute() : 0,
        total: this.website.analytics.enabled ? this.website.analytics.requests : 0,
        hour: this.website.analytics.enabled ? this.website.analytics.getRequestsPerHour() : 0
      },
      organisations: (await organisations.collection.countDocuments()),
      projects: (await projects.collection.countDocuments()),
      users: (await users.collection.countDocuments())
    });
  }
}