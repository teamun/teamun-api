'use strict';

/**
 * Module dependencies.
 */
var notifications = require('../controllers/notifications.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  app.route(config.app.restApiRoot + '/notifications').get(notifications.list);
  app.route(config.app.restApiRoot + '/notifications/unread-total-count').get(notifications.unreadTotalCount);
  app.route(config.app.restApiRoot + '/notifications/:notificationID').get(notifications.findOne);
  
};
