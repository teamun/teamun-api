'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有activities controllers
 */
module.exports = _.extend(  
  require('./organizers/organizer.admin.server.controller'),
  require('./organizers/organizer.site.server.controller'),
  require('./organizers/organizer.common.server.controller')
);
