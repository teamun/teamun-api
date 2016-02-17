'use strict';

/**
 * Module dependencies.
 */
var events = require('../controllers/events.server.controller');
var config = require('../../config/config');

module.exports = function(app) {
  /*------------------------------------------  events routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/events').get(events.list);
  
  /*------------------------------------------  event admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/events').get(events.list);
  app.route(config.app.restApiRoot + '/admin/events').post(events.create);
  app.route(config.app.restApiRoot + '/admin/events/:eventID').get(events.findOne);
  app.route(config.app.restApiRoot + '/admin/events/:eventID').put(events.update);
  app.route(config.app.restApiRoot + '/admin/events/:eventID').delete(events.delete);

  app.param('eventID', events.eventByID);
};
