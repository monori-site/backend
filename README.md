# Monori
[![Stars](https://img.shields.io/github/stars/auguwu/Monori?style=flat-square)](https://github.com/auguwu/monori) [![Workflow Status](https://github.com/auguwu/Monori/workflows/ESLint/badge.svg)](https://github.com/auguwu/monori/tree/master/.github/workflows) [![Dependencies](https://img.shields.io/david/dev/auguwu/Monori?style=flat-square)](/package.json)

> :ghost: **| Simple and open-source translation site for everyone to use, for free.**

## Why?
Because none of the services suited to what I wanted for it plus some are paid, so I thought of doing it myself.

## Ecosystem
- [Backend API](/packages/backend)
- [Frontend](/packages/frontend)

## Installation
> This project is currently in development, so these steps might change in the drastic future.

### Requirements
- Node.js v10 or higher
- PostgreSQL
- Redis

### Process
- [Fork](https://github.com/auguwu/Monori/fork) the repository
- Clone the repository to your local machine (``git clone https://github.com/YOUR_USERNAME/monori``)
- Change the directory to the repository (``cd monori``) and run `node cli/monori.js install-deps` to install the dependencies or go to `packages/monori-<package>` and install it from there (`<package>` being "backend" or "frontend", both dependency chains must be installed to be continue)
- Run `node cli/monori.js build` to build the backend and frontend sources, and it'll be placed in `$ROOT/.monori` when done (`$ROOT being the root directory where you installed monori`)
- Fill out the configurations for both packages
- Then run `node cli/monori.js run-concurrently` to run both the backend and frontend concurrently at the same time or use `pm2 start pm2.config.js` to run both applications with PM2

## License
**Monori** is released under the MIT License, read [here](/LICENSE) for more information.