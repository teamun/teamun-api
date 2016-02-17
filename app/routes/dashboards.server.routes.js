'use strict';

/**
 * Module dependencies.
 */
var dashboards = require('../controllers/dashboards.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  /*------------------------------------------  dashboards admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/dashboards/users-teams-activities-counts').get(dashboards.counts);

};
