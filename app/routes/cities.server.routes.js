'use strict';

/**
 * Module dependencies.
 */
var cities = require('../controllers/cities.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  app.route(config.app.restApiRoot + '/cities').get(cities.list);
  app.route(config.app.restApiRoot + '/cities/:cityID').get(cities.findOne);
  
};
