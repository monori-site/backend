import { Server } from 'http';
// Extension to add "server" to app.locals

import { Server as Monori } from '../structures/Server';

declare module 'express' {
  interface Application {
    locals: {
      [x: string]: any;
      server: Monori;
    };
  }
}
