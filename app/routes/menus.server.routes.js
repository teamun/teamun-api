'use strict';

/**
 * Module dependencies.
 */
var menus = require('../controllers/menus.server.controller');
var config = require('../../config/config');

module.exports = function(app) {
  
  /*------------------------------------------  menus admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/menus').get(menus.list);
  app.route(config.app.restApiRoot + '/admin/menus/parents').get(menus.parents);
  app.route(config.app.restApiRoot + '/admin/menus/owned-parents').get(menus.ownedParents);
  app.route(config.app.restApiRoot + '/admin/menus/children').get(menus.children);
  app.route(config.app.restApiRoot + '/admin/menus').post(menus.create);
  app.route(config.app.restApiRoot + '/admin/menus/:menuID').get(menus.findOne);
  app.route(config.app.restApiRoot + '/admin/menus/:menuID').delete(menus.delete);
  app.route(config.app.restApiRoot + '/admin/menus/:menuID').put(menus.update);

  app.param('menuID', menus.menuByID);

};
