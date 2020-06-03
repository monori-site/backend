import fastify from 'fastify';

declare module 'fastify' {
  interface FastifyReply<HttpResponse> {
    render(page: string, props?: Record<string, unknown>): void;
  }
}