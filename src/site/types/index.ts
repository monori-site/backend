import type { FastifyReply, FastifyRequest, DefaultQuery, DefaultHeaders, DefaultBody, DefaultParams } from 'fastify';
import type { ServerResponse, IncomingMessage } from 'http';

type FastifyResponse = FastifyReply<ServerResponse>;
export interface NormalProperties<Q = DefaultQuery, H = DefaultHeaders, B = DefaultBody, P = DefaultParams> {
  req: FastifyRequest<IncomingMessage, Q, P, H, B>;
  res: FastifyResponse;
}