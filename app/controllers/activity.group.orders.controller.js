'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有activities controllers
 */
module.exports = _.extend(
  require('./activity-group-orders/activity.group.orders.mobile.controller'),
  require('./activity-group-orders/activity.group.orders.site.controller')
);
