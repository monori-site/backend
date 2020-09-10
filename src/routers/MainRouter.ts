/**
 * Copyright (c) 2020 August
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { Server } from '../structures';
import { Router } from 'express';

const router = Router();
router.get('/', (_, res) => res.status(200).json({
  message: 'Welcome to the Monori API, read the docs for more information.',
  version: `v${require('../../package.json').version}`,
  docs: 'https://github.com/monori-site/backend/blob/master/docs/API.md'
}));

router.get('/health', async (req, res) => {
  const server: Server = req.app.locals.server;

  return res.status(200).json({
    database: server.database.online,
    redis: server.redis.online,
    gc: server.config.analytics.enabled ? server.analytics.gc : null
  });
});

router.get('/favicon.ico', (_, res) => res.status(404).send('Cannot GET /favicon.ico'));

export default { path: '', router };
