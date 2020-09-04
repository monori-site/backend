import { Server } from '../structures/Server';

declare module 'express' {
  interface Application {
    locals: {
      [x: string]: any;
      server: Server;
    };
  }

  interface Express {
    locals: {
      [x: string]: any;
      server: Server;
    }
  }
}
