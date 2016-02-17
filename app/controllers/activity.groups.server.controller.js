'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有activity groups controllers
 */
module.exports = _.extend(  
  require('./activity-groups/activity.groups.admin.server.controller'),
  require('./activity-groups/activity.groups.site.server.controller'),
  require('./activity-groups/activity.groups.mobile.server.controller'),
  require('./activity-groups/activity.groups.common.server.controller')
);

