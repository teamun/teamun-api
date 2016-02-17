'use strict';

/**
 * Module dependencies.
 */
var hots = require('../controllers/hots.server.controller');
var config = require('../../config/config');

module.exports = function(app) {
  
  /*------------------------------------------  hot admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/hots').get(hots.listForAdmin);
  app.route(config.app.restApiRoot + '/admin/hots').post(hots.createForAdmin);
  app.route(config.app.restApiRoot + '/admin/hots/:hotID').get(hots.findOneForAdmin);
  app.route(config.app.restApiRoot + '/admin/hots/:hotID').put(hots.updateForAdmin);
  app.route(config.app.restApiRoot + '/admin/hots/:hotID').delete(hots.deleteForAdmin);

  /*------------------------------------------  hot site routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/site/hots').get(hots.listForSite);

  /*------------------------------------------  hot mobile routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/mobile/hots').get(hots.listForMobile);

  app.param('hotID', hots.hotByID);

};
