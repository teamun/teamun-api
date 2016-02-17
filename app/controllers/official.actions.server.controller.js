'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有 official actions controllers
 */
module.exports = _.extend(  
  require('./official-actions/official-action.admin.server.controller'),
  require('./official-actions/official-action.site.server.controller'),
  require('./official-actions/official-action.mobile.server.controller'),
  require('./official-actions/official-action.common.server.controller')
);
