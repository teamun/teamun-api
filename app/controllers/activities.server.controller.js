'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有activities controllers
 */
module.exports = _.extend(  
  require('./activities/activity.mobile.server.controller'),
  require('./activities/activity.site.server.controller'),
  require('./activities/activity.admin.server.controller'),
  require('./activities/activity.common.server.controller')
);
