import { IncomingMessage } from 'http';
import CurrentSession from '../middleware/session/Session';
import fastify from 'fastify';

declare module 'fastify' {
  interface FastifyReply<HttpResponse> {
    render(page: string, props?: Record<string, unknown>): void;
  }

  interface FastifyRequest<
    HttpRequest = IncomingMessage,
    Query = fastify.DefaultQuery,
    Params = fastify.DefaultParams,
    Headers = fastify.DefaultHeaders,
    Body = any
  > {
    session: CurrentSession | null;
  }
}