'use strict';

/**
 * Module dependencies.
 */
var teams = require('../controllers/teams.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  /*------------------------------------------  teams api routes  -----------------------------------------------*/

  



  /*------------------------------------------  teams admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/teams').get(teams.list);
  app.route(config.app.restApiRoot + '/admin/teams').post(teams.create);
  app.route(config.app.restApiRoot + '/admin/teams/:teamID').get(teams.findOne);
  app.route(config.app.restApiRoot + '/admin/teams/:teamID').put(teams.update);
  app.route(config.app.restApiRoot + '/admin/teams-recommend').get(teams.recommendList);
  app.route(config.app.restApiRoot + '/admin/teams-recommend-remove/:teamID').put(teams.recommendRemove);

  app.param('teamID', teams.teamByID);

};
