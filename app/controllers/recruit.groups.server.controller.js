'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有 recruit groups controllers
 */
module.exports = _.extend(  
  require('./recruit-groups/recruit.groups.admin.server.controller'),
  require('./recruit-groups/recruit.groups.site.server.controller'),
  require('./recruit-groups/recruit.groups.common.server.controller')
);
