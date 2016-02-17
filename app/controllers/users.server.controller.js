'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有user controller
 */
module.exports = _.extend(
  require('./users/users.authentication.server.controller'),
  require('./users/users.authorization.server.controller'),
  require('./users/users.profile.server.controller'),
  require('./users/users.watch.server.controller')
);
