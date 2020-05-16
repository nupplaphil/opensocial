require('ts-node/register');

import loadConfig from './src/config/knex';

module.exports = loadConfig();

