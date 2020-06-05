import { IncomingMessage } from 'http';
import { UserModel } from '../core/repository/UserRepository';
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
    destroySession(sessionID: string): void;
    createSession(pkt: UserModel): void;
    session: CurrentSession | null;
  }
}