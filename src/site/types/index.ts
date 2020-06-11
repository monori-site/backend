import type { FastifyReply, FastifyRequest, DefaultQuery, DefaultHeaders, DefaultBody, DefaultParams } from 'fastify';
import type { ServerResponse, IncomingMessage } from 'http';

//* This looks ugly but this is what I get for forcing myself to use Fastify for this project
// TODO: Find a way to conjoin generics

type FastifyResponse = FastifyReply<ServerResponse>;
export type Request = FastifyRequest<IncomingMessage, DefaultQuery, DefaultParams, DefaultHeaders, any>;
export interface NormalProperties {
  req: Request;
  res: FastifyResponse;
}