'use strict';

/**
 * Module dependencies.
 */
var activityGroupOrders = require('../controllers/activity.group.orders.controller');
var config = require('../../config/config');

module.exports = function(app) {

  /*------------------------------------------  activity-groups mobile routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/activity-group-orders').get(activityGroupOrders.listForMobile);
  app.route(config.app.restApiRoot + '/activity-group-orders/:activityGroupOrderID').get(activityGroupOrders.findOneForMobile);
  // app.route(config.app.restApiRoot + '/activity-groups/quit/:activityGroupID').put(activityGroupOrders.quitForMobile);
  // app.route(config.app.restApiRoot + '/activity-groups/kickout/:activityGroupID').put(activityGroupOrders.kickoutForMobile);
  // app.route(config.app.restApiRoot + '/activity-groups/members/:activityID').get(activityGroupOrders.membersForMobile);

  /*------------------------------------------  activity-groups site routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/site/activity-group-orders').get(activityGroupOrders.listForSite);
  app.route(config.app.restApiRoot + '/site/activity-group-orders/:activityGroupOrderID').get(activityGroupOrders.findOneForMobile);
  // app.route(config.app.restApiRoot + '/site/activity-groups/quit/:activityGroupID').put(activityGroupOrders.quitForSite);
  // app.route(config.app.restApiRoot + '/site/activity-groups').post(activityGroupOrders.createForSite);
  // app.route(config.app.restApiRoot + '/site/activity-groups/:activityID').get(activityGroupOrders.findOneForSite);
  // app.route(config.app.restApiRoot + '/site/activity-groups/:activityGroupID/edit').get(activityGroupOrders.findOneForEditForSite);
  // app.route(config.app.restApiRoot + '/site/activity-groups/:activityGroupID').put(activityGroupOrders.updateForSite);
  // app.route(config.app.restApiRoot + '/site/activity-groups/:activityGroupID').delete(activityGroupOrders.deleteForSite);
  // app.route(config.app.restApiRoot + '/site/activity-groups/members/:activityID').get(activityGroupOrders.membersForSite);


  // /*------------------------------------------  activity-groups admin routes  -----------------------------------------------*/
  // app.route(config.app.restApiRoot + '/admin/activity-groups').post(activityGroupOrders.createForAdmin);
  // app.route(config.app.restApiRoot + '/admin/activity-groups/:activityID').get(activityGroupOrders.findOneForAdmin);
  // app.route(config.app.restApiRoot + '/admin/activity-groups/:activityGroupID/edit').get(activityGroupOrders.findOneForEditForAdmin);
  // app.route(config.app.restApiRoot + '/admin/activity-groups/:activityGroupID').put(activityGroupOrders.updateForAdmin);
  // app.route(config.app.restApiRoot + '/admin/activity-groups/:activityGroupID').delete(activityGroupOrders.deleteForAdmin);
  // app.route(config.app.restApiRoot + '/admin/activity-groups/members/:activityID').get(activityGroupOrders.membersForAdmin);

  // app.param('activityGroupID', activityGroupOrders.activityGroupByID);

};
