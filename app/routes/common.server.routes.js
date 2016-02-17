'use strict';

/**
 * Module dependencies.
 */
var common = require('../controllers/common.server.controller');
var users = require('../controllers/users.server.controller');
var config = require('../../config/config');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

module.exports = function(app) {
  
  /*------------------------------------------  commons routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/upload').post(multipartyMiddleware, common.upload);
  app.route(config.app.restApiRoot + '/uptoken').get(common.uptoken);
  app.route(config.app.restApiRoot + '/check-available-mobile').post(common.checkAvailableMobile);
  app.route(config.app.restApiRoot + '/check-available-email').post(common.checkAvailableEmail);



  // app.route(config.app.restApiRoot + '/promisetest').get(common.promisetest);

};
