import type { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import type { ServerResponse } from 'http';
import signature from 'cookie-signature';
import Session from './Session';
import plugin from 'fastify-plugin';
import { sign } from 'crypto';

type ValidateHook = (request: FastifyRequest, reply: FastifyReply<ServerResponse>, done: (error?: FastifyError) => void) => void;
type SendHook = (
  request: FastifyRequest,
  reply: FastifyReply<ServerResponse>,
  payload: any,
  done: (error?: FastifyError) => void
) => void;

interface Store {
  delete(sessionID: string): void;
  create(session: Session): void;
  get(sessionID: string, callback: (error: Error | null, packet?: Session) => void): void;
}

function factory(server: FastifyInstance, options: {
  secret: string;
  store: Store;
  path?: string;
}, next: (error?: FastifyError) => void) {
  server.decorateRequest('destroySession', function onDestroy(this: FastifyRequest, sessionID: string) {
    return destroyConnection.apply(this, [options.store, sessionID]);
  });
  server.decorateRequest('session', null);
  server.addHook('preValidation', onPreValidation(options));
  server.addHook('onSend', onSend(options));

  next();
}

function onPreValidation({ path, store, secret }: { store: Store, secret: string, path?: string; }): ValidateHook {
  return (req, _, next) => {
    if (req.req.url?.indexOf(path || '/') !== 0) return next();

    const id = req.cookies['current-session'];

    if (!req.cookies.hasOwnProperty('current-session')) {
      createSession(req, secret, store, next);
    } else {
      let decrypted = signature.unsign(id, secret);
      if (!decrypted) createSession(req, secret, store, next);
      else {
        store.get(decrypted, (error, session) => {
          if (error) {
            if ((error as any).code === 'ENOENT') createSession(req, secret, store, next);
            else return next(error);
          } else {
            if (session === null) return createSession(req, secret, store, next);
            if (session && session.isExpired()) {
              return store.delete(session.sessionID);
            }

            req.session = new Session(secret, session);
            next();
          }
        });
      }
    }
  };
}

function onSend({ store, secret }: {
  secret: string;
  store: Store;
}): SendHook {
  return (req, reply, _, next) => {
    const current = req.session;
    if (!current || !current.sessionID || !saveSession(req)) return next();

    store.create(new Session(secret));
    reply.setCookie('current-session', current.encryptedSessionID);
    return next();
  };
}

function createSession(request: FastifyRequest, secret: string, store: Store, done: (error?: FastifyError) => void) {
  const session = new Session(secret);
  store.create(session);

  request.session = session;
  done();
}

function destroyConnection(this: FastifyRequest, store: Store, sessionID: string) {
  store.get(sessionID, (error, packet) => {
    if (error) {
      website.log('fatal', `Unable to find session by ${sessionID} (source: fastify-i18n-session)`);
      return;
    }

    store.delete(packet!.encryptedSessionID);
  });
}

function getRequestProto(request: FastifyRequest) {
  return request.headers['x-forwarded-proto'] || 'http';
}

function isEncrypted(request: FastifyRequest) {
  const current = request.req.connection;
  if (current && (current as any).encrypted) return true;

  return false;
}

function saveSession(request: FastifyRequest) {
  if (isEncrypted(request)) return true;

  const proto = getRequestProto(request);
  return proto === 'https';
}

const mod = plugin(factory, {
  fastify: '>=2.14',
  name: 'fastify-i18n-session'
});

export default mod;