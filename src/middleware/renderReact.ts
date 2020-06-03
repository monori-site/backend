// Based on express-react-views but with Fastify!
// All credits goes to the original creators
// https://www.npmjs.com/package/express-react-views

import { FastifyReply as Response, FastifyInstance, FastifyError } from 'fastify';
import { Logger, ConsoleTransport } from '@augu/logging';
import type { ServerResponse } from 'http';
import DOMServer from 'react-dom/server';
import { join } from 'path';
import plugin from 'fastify-plugin';
import React from 'react';

const logger = new Logger('React Engine', { transports: [new ConsoleTransport()] });
function factory(server: FastifyInstance, _: any, next: ((error?: FastifyError) => void)) {
  server.decorateReply('render', function (this: Response<ServerResponse>, path: string, props?: Record<string, unknown>) {
    logger.info(`Now rendering page ${path}...`);

    const allPaths = path.split('/');
    let endPath = allPaths[allPaths.length - 1];

    if (!endPath.endsWith('.jsx')) endPath += '.jsx';

    const filepath = join(process.cwd(), 'site', ...allPaths);
    let initial = '<!DOCTYPE html>';
    const component = require(filepath);

    initial += DOMServer.renderToStaticMarkup(React.createElement(component, props));
    this
      .type('text/html')
      .send(initial);
  });

  logger.info('React Engine has been initialised');
  next();
}

const mod = plugin(factory, {
  fastify: '>=2.14',
  name: 'fastify-react'
});

export default mod;