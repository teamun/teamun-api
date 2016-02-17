'use strict';

/**
 * Module dependencies.
 */
var organizers = require('../controllers/organizers.server.controller');
var config = require('../../config/config');

module.exports = function(app) {
  
  /*------------------------------------------  Organizer site routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/site/organizers/:organizerID').get(organizers.findOneForSite);
  app.route(config.app.restApiRoot + '/site/organizers/by-mobile/:mobile').get(organizers.listForSite);

  
  /*------------------------------------------  Organizer admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/organizers').get(organizers.listForAdmin);
  app.route(config.app.restApiRoot + '/admin/organizers').post(organizers.createForAdmin);
  app.route(config.app.restApiRoot + '/admin/organizers/:organizerID').get(organizers.findOneForAdmin);
  app.route(config.app.restApiRoot + '/admin/organizers/:organizerID').put(organizers.updateForAdmin);
  app.route(config.app.restApiRoot + '/admin/organizers/:organizerID').delete(organizers.deleteForAdmin);
  app.route(config.app.restApiRoot + '/admin/organizers/:organizerID/:userID/removecaptain').put(organizers.removeCaptainForAdmin);

  app.param('organizerID', organizers.organizerByID);
};
