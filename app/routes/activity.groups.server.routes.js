'use strict';

/**
 * Module dependencies.
 */
var activityGroups = require('../controllers/activity.groups.server.controller');
var config = require('../../config/config');

module.exports = function(app) {
  
  /*------------------------------------------  activity-groups mobile routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/activity-groups/join/:activityGroupID').put(activityGroups.joinForMobile);
  app.route(config.app.restApiRoot + '/activity-groups/quit/:activityGroupID').put(activityGroups.quitForMobile);
  app.route(config.app.restApiRoot + '/activity-groups/kickout/:activityGroupID').put(activityGroups.kickoutForMobile);
  app.route(config.app.restApiRoot + '/activity-groups/members/:activityID').get(activityGroups.membersForMobile);


  /*------------------------------------------  activity-groups site routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/site/activity-groups/join/:activityGroupID').put(activityGroups.joinForSite);
  app.route(config.app.restApiRoot + '/site/activity-groups/quit/:activityGroupID').put(activityGroups.quitForSite);
  app.route(config.app.restApiRoot + '/site/activity-groups').post(activityGroups.createForSite);
  app.route(config.app.restApiRoot + '/site/activity-groups/:activityID').get(activityGroups.findOneForSite);
  app.route(config.app.restApiRoot + '/site/activity-groups/:activityGroupID/edit').get(activityGroups.findOneForEditForSite);
  app.route(config.app.restApiRoot + '/site/activity-groups/:activityGroupID').put(activityGroups.updateForSite);
  app.route(config.app.restApiRoot + '/site/activity-groups/:activityGroupID').delete(activityGroups.deleteForSite);
  app.route(config.app.restApiRoot + '/site/activity-groups/members/:activityID').get(activityGroups.membersForSite);


  /*------------------------------------------  activity-groups admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/activity-groups').post(activityGroups.createForAdmin);
  app.route(config.app.restApiRoot + '/admin/activity-groups/:activityID').get(activityGroups.findOneForAdmin);
  app.route(config.app.restApiRoot + '/admin/activity-groups/:activityGroupID/edit').get(activityGroups.findOneForEditForAdmin);
  app.route(config.app.restApiRoot + '/admin/activity-groups/:activityGroupID').put(activityGroups.updateForAdmin);
  app.route(config.app.restApiRoot + '/admin/activity-groups/:activityGroupID').delete(activityGroups.deleteForAdmin);
  app.route(config.app.restApiRoot + '/admin/activity-groups/members/:activityID').get(activityGroups.membersForAdmin);

  app.param('activityGroupID', activityGroups.activityGroupByID);

};
