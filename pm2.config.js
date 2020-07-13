/**
 * Configuration for Monori to run on PM2
 */
module.exports = {
  apps: [
    {
      name: 'monori-backend',
      script: './scripts/monori.js run-backend'
    },
    {
      name: 'monori-frontend',
      script: './scripts/monori.js run-frontend'
    }
  ]
};