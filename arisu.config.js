/* eslint-disable camelcase */

const { join } = require('path');

/**
 * Configuration file for Arisu to detect this repository as a project.
 *
 * Read more [here](...)
 */
module.exports = {
  translations: join(__dirname, 'themes'),
  format_type: 'json',
  repository: 'arisu/arisu',
  github: {
    repository: 'https://github.com/arisuland/Arisu',
    git_module: [true, 'themes'],
    enabled: true
  }
};
