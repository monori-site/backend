import { Server } from 'http';
// Extension to add "server" to app.locals

import Monori from '../structures/Server';

declare module 'express' {
  interface Application {
    locals: {
      [x: string]: any;
      server: typeof Monori;
    };
  }
}
