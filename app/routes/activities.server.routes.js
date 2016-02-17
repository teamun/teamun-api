'use strict';

/**
 * Module dependencies.
 */
var activities = require('../controllers/activities.server.controller');
var config = require('../../config/config');

module.exports = function(app) {

  /*------------------------------------------  activities mobile routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/activities').post(activities.createForMobile);
  app.route(config.app.restApiRoot + '/activities').get(activities.listForMobile);
  app.route(config.app.restApiRoot + '/activities/:activityID').get(activities.findOneForMobile);
  app.route(config.app.restApiRoot + '/activities/:activityID').put(activities.updateForMobile);


  
  /*------------------------------------------  activities admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/activities').get(activities.listForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities').post(activities.createForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities/:activityID').get(activities.findOneForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities/:activityID/edit').get(activities.findOneForEditForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities/:activityID').put(activities.updateForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities/:activityID/publish').put(activities.publishForAdmin);

  app.route(config.app.restApiRoot + '/admin/activities-remove/:activityID').put(activities.removeForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities-recommend').get(activities.recommendListForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities-recommend-add/:activityID').put(activities.recommendAddForAdmin);
  app.route(config.app.restApiRoot + '/admin/activities-recommend-remove/:activityID').put(activities.recommendRemoveForAdmin);


  /*------------------------------------------  activities site routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/site/activities').post(activities.createForSite);
  app.route(config.app.restApiRoot + '/site/activities').get(activities.listForSite);
  app.route(config.app.restApiRoot + '/site/activities/:activityID').get(activities.findOneForSite);
  app.route(config.app.restApiRoot + '/site/activities/:activityID/edit').get(activities.findOneForEditForSite);
  app.route(config.app.restApiRoot + '/site/activities/:activityID').put(activities.updateForSite);
  app.route(config.app.restApiRoot + '/site/activities/:activityID/publish').put(activities.publishForSite);


  app.param('activityID', activities.activityByID);

};
