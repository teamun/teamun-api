'use strict';

/**
 * Module dependencies.
 */
var wechats = require('../controllers/wechats.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  /*------------------------------------------  wechats activities routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/wechats/sign').get(wechats.getSignPackage);
  app.route(config.app.restApiRoot + '/wechats/activities/activity-add').get(wechats.add);
  app.route(config.app.restApiRoot + '/wechats/activities/activity-save').post(wechats.create);
  app.route(config.app.restApiRoot + '/wechats/activities/activity-join').post(wechats.join);
  app.route(config.app.restApiRoot + '/wechats/activities/activity-quit').delete(wechats.quit);
  app.route(config.app.restApiRoot + '/wechats/activities/activity-remove').delete(wechats.remove);
  app.route(config.app.restApiRoot + '/wechats/activities/activity-list').get(wechats.getList);
  app.route(config.app.restApiRoot + '/wechats/activities/activity-join-list/:wechatActivityID').get(wechats.getJoinList);
  app.route(config.app.restApiRoot + '/wechats/activities/:wechatActivityID').get(wechats.findOne);
  app.route(config.app.restApiRoot + '/wechats/activities/detail/:wechatActivityID').get(wechats.findActivityDetail);
  app.route(config.app.restApiRoot + '/wechats/activities/list/:openid').get(wechats.list);

  /*------------------------------------------  wechats climb game routes  -----------------------------------------------*/

  app.route(config.app.restApiRoot + '/wechats/climb-game/user-info').get(wechats.getClimbUserInfo);

  /*------------------------------------------  wechats activities admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/wechats/admin/wechats/activities').get(wechats.adminActivities);
  app.route(config.app.restApiRoot + '/wechats/admin/wechats/activity-join-list').get(wechats.adminGetJoinList);
  app.route(config.app.restApiRoot + '/wechats/admin/wechats/activities/activity-join-list/:wechatActivityID').get(wechats.getJoinList);
  app.route(config.app.restApiRoot + '/wechats/admin/wechats/activities/:wechatActivityID').get(wechats.findOne);


  app.param('wechatActivityID', wechats.wechatActivityByID);
};
