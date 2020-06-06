import type { FastifyReply, FastifyRequest, DefaultQuery, DefaultHeaders, DefaultBody, DefaultParams } from 'fastify';
import type { ServerResponse, IncomingMessage } from 'http';

//* This looks ugly but this is what I get for forcing myself to use Fastify for this project
// TODO: Find a way to conjoin generics

type FastifyResponse = FastifyReply<ServerResponse>;
export interface NormalProperties<Q = DefaultQuery, H = DefaultHeaders, B = DefaultBody, P = DefaultParams> {
  req: FastifyRequest<IncomingMessage, Q, P, H, B>;
  res: FastifyResponse;
}