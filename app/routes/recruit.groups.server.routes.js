'use strict';

/**
 * Module dependencies.
 */
var recruitGroups = require('../controllers/recruit.groups.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  /*------------------------------------------  recruit-groups admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/recruit-groups').post(recruitGroups.createForAdmin);
  app.route(config.app.restApiRoot + '/admin/recruit-groups/:actionID').get(recruitGroups.findGroupsByActionIDForAdmin);
  app.route(config.app.restApiRoot + '/admin/recruit-groups/:recruitGroupID/edit').get(recruitGroups.findOneForEditForAdmin);
  app.route(config.app.restApiRoot + '/admin/recruit-groups/:recruitGroupID').put(recruitGroups.updateForAdmin);
  app.route(config.app.restApiRoot + '/admin/recruit-groups/:recruitGroupID').delete(recruitGroups.deleteForAdmin);


  /*------------------------------------------  recruit-groups site routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/site/recruit-groups/join/:recruitGroupID').put(recruitGroups.joinForSite);
  app.route(config.app.restApiRoot + '/site/recruit-groups/quit/:recruitGroupID').put(recruitGroups.quitForSite);
  app.route(config.app.restApiRoot + '/site/recruit-groups/:recruitID').get(recruitGroups.findOneForSite);
  app.route(config.app.restApiRoot + '/site/recruit-groups/members/:recruitID').get(recruitGroups.membersForSite);

  app.param('recruitGroupID', recruitGroups.recruitGroupByID);

};
