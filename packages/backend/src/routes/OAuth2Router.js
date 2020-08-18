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

const { randomBytes } = require('crypto');
const { HttpClient } = require('@augu/orchid');
const { version } = require('../../package.json');
const { Router } = require('../structures');
const { Queue } = require('@augu/immutable');

const router = new Router('/oauth2');
const states = new Queue();
const http = new HttpClient({ agent: `Monori (v${version}, https://github.com/auguwu/Monori)` });

router.get({
  path: '/github',
  async run(req, res) {
    if (await this.sessions.exists(req.connection.remoteAddress)) return res.status(403).json({
      statusCode: 403,
      message: 'User has a session occuring, continue'
    });
  
    if (!this.config.github.enabled) return res.status(500).json({
      statusCode: 500,
      message: 'GitHub OAuth2 isn\'t enabled, if this keeps occuring: contact an administrator'
    });
  
    const redirectUrl = this.config.github.callbackUrl.replace(/[$]port/g, this.config.port);
    const state = randomBytes(4).toString('hex');
    states.add(state);
  
    return res.redirect(`https://github.com/login/oauth/authorize?client_id=${this.config.github.clientID}&redirect_url=${encodeURIComponent(redirectUrl)}&scope=${this.config.github.scopes}&state=${state}`);
  }
});

router.get({
  path: '/github/callback',
  async run(req, res) {
    if (!req.query.code || !req.query.state) return res.status(403).json({
      statusCode: 403,
      message: `${req.query.error} - ${req.query.error_description}`
    });
  
    if (!states.includes(req.query.state)) return res.status(401).json({
      statusCode: 401,
      message: `State "${req.query.state}" is invalid`
    });
  
    try {
      const oauthReq = await http.request({
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        url: `https://github.com/login/oauth/access_token?client_id=${this.config.github.clientID}&client_secret=${this.config.github.clientSecret}&code=${req.query.code}&state=${req.query.state}`
      });
  
      const data = oauthReq.json();
      const userReq = await http.request({
        method: 'GET',
        headers: {
          Authorization: `token ${data.access_token}`,
          Accept: 'application/json'
        },
        url: 'https://api.github.com/user'
      });
  
      const user = userReq.json();
      if (!(await this.sessions.exists(req.connection.remoteAddress))) return res.status(403).json({
        statusCode: 403,
        message: 'Not logged in :('
      });

      const session = await this.sessions.get(req.connection.remoteAddress);
      const query = await this.database.getUser('id', session.userID);

      if (query !== null) {
        if (query.github === null || query.github !== String(user.id)) await this.database.updateUser(session.userID, { github: String(user.id) });
        return res.redirect('https://github.com'); 
      } else {
        return res.status(401).json({
          statusCode: 401,
          message: 'User doesnt exist?'
        });
      }
    } catch(ex) {
      return res.status(500).json({
        statusCode: 500,
        message: `[${ex.name}] ${ex.message}`
      });
    }
  }
});

module.exports = router;