'use strict';

/**
 * Module dependencies.
 */
var users = require('../controllers/users.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  /*------------------------------------------  users routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/users').get(users.requiresLogin, users.list);
  app.route(config.app.restApiRoot + '/users').post(users.create);
  app.route(config.app.restApiRoot + '/users/me').get(users.me);
  app.route(config.app.restApiRoot + '/users/activities').get(users.findActivities);
  app.route(config.app.restApiRoot + '/users/official-actions').get(users.findOfficialActions);
  app.route(config.app.restApiRoot + '/users/by-mobile/:mobile').get(users.findOneByMobile);
  app.route(config.app.restApiRoot + '/users/watch/follow').put(users.follow);
  app.route(config.app.restApiRoot + '/users/watch/unfollow').put(users.unfollow);
  app.route(config.app.restApiRoot + '/users/watch/follower').get(users.follower);
  app.route(config.app.restApiRoot + '/users/watch/following').get(users.following);
  app.route(config.app.restApiRoot + '/users/:userID').get(users.requiresLogin, users.findOne);
  app.route(config.app.restApiRoot + '/users/:userID').put(users.update);
  app.route(config.app.restApiRoot + '/users/:userID').delete(users.requiresLogin, users.delete);


  app.route(config.app.restApiRoot + '/auth/sendsmscode').post(users.sendsmscode);
  app.route(config.app.restApiRoot + '/auth/checksmscode').post(users.checksmscode);
  app.route(config.app.restApiRoot + '/auth/signup').post(users.signup);
  app.route(config.app.restApiRoot + '/auth/signin').post(users.signin);
  app.route(config.app.restApiRoot + '/auth/signout').get(users.signout);
  app.route(config.app.restApiRoot + '/auth/login').post(users.login);
  app.route(config.app.restApiRoot + '/auth/authenticate').post(users.authenticate);
  app.route(config.app.restApiRoot + '/auth/resetpasswd').post(users.resetpasswd);

  
  /*------------------------------------------  users admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/admins').get(users.requiresLogin, users.admins);
  app.route(config.app.restApiRoot + '/admin/users/add-tag/:user_id/:tag').put(users.requiresLogin, users.addTag);
  app.route(config.app.restApiRoot + '/admin/users/remove-tag/:user_id/:tag').put(users.requiresLogin, users.removeTag);


  /*------------------------------------------  users mobile routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/mobile/users/:userID').put(users.updateForMobile);

  app.param('userID', users.userByID);

};
