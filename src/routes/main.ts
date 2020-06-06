import type { FastifyRequest, FastifyReply, DefaultHeaders, DefaultParams, DefaultQuery, DefaultBody } from 'fastify';
import { Route, BaseRouter, Website, Method, passwords } from '../core';
import type { ServerResponse, IncomingMessage } from 'http';
import { pbkdf2Sync } from 'crypto';

type RequestWithQuery<T> = FastifyRequest<IncomingMessage, T, DefaultParams, DefaultHeaders, DefaultBody>;
type RequestWithBody<T> = FastifyRequest<IncomingMessage, DefaultQuery, DefaultParams, DefaultHeaders, T>;
type Reply = FastifyReply<ServerResponse>;

interface LoginPayload {
  username: string;
  password: string;
}

interface SignupPayload {
  username: string;
  password: string;
  email: string;
}

interface SuccessPayload {
  success?: boolean;
  error?: string;
}

export default class MainRouter extends BaseRouter {
  constructor(website: Website) {
    super(website, '/');
  }

  @Route('/', { method: Method.Get })
  async main(req: FastifyRequest, res: Reply) {
    return res.render('pages/Homepage', {
      user: req.session?.user
    });
  }

  @Route('/login', { method: Method.Get })
  async login(req: RequestWithQuery<SuccessPayload>, res: Reply) {
    if (req.session) return res.redirect('/');
    return res.render('pages/Login', {
      success: req.query.success,
      error: req.query.error
    });
  }

  @Route('/login/callback', { method: Method.Post })
  async _login(req: RequestWithBody<LoginPayload>, res: Reply) {
    if (req.session) return res.redirect('/');

    const accounts = this.website.database.getRepository('users');
    const user = await accounts.get(req.body.username);
    if (!user || user === null) return res.render('/login?success=false&error=User was not found');

    if (!passwords.decrypt(user.password, user.passwordHash, { })) return res.render('/login?success=false&error=Invalid password');

    req.createSession(user);
    return res.redirect('/');
  }

  @Route('/signup', { method: Method.Get })
  async signup(req: FastifyRequest, res: Reply) {
    if (req.session) return res.redirect('/');
    return res.render('pages/Signup');
  }

  @Route('/signup/callback', { method: Method.Post })
  async _signup(req: RequestWithBody<SignupPayload>, res: Reply) {
    if (req.session) return res.redirect('/');


  }
}