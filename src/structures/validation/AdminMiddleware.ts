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

import type { Middleware, Server } from '..';

const mod: Middleware = async (req, res, next) => {
  try {
    const server: Server = req.app.locals.server;
    if (!(await server.sessions.has(req.connection.remoteAddress || 'local'))) return res.status(401).json({
      message: 'User isn\'t logged in'
    });

    const session = await server.sessions.get(req.connection.remoteAddress || 'local');
    if (session === null) return res.status(401).json({
      message: 'User isn\'t logged in'
    });

    const user = await server.database.get('users', ['id', session.user]);
    if (user === null) return res.status(403).json({
      message: `Session is made but user "${session.user}" doesn't exist?`
    });

    if (!user.admin) return res.status(403).json({
      message: 'User is not an administrator'
    });

    return next();
  } catch(ex) {
    return res.status(500).json({
      message: 'Internal server error -- report this to administrators',
      error: {
        message: `[${ex.name}] ${ex.message}`,
        stack: ex.stack ? ex.stack : null
      }
    });
  }
};

export default mod;
