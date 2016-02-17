'use strict';

/**
 * Module dependencies.
 */
var officialActions = require('../controllers/official.actions.server.controller');
var config = require('../../config/config');

module.exports = function(app) {
  
  /*------------------------------------------  official action admin routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/admin/official-actions').get(officialActions.listForAdmin);
  app.route(config.app.restApiRoot + '/admin/official-actions').post(officialActions.createForAdmin);
  app.route(config.app.restApiRoot + '/admin/official-actions/:officialActionID').get(officialActions.findOneForAdmin);
  app.route(config.app.restApiRoot + '/admin/official-actions/:officialActionID').put(officialActions.updateForAdmin);
  app.route(config.app.restApiRoot + '/admin/official-actions/:officialActionID').delete(officialActions.deleteForAdmin);
  app.route(config.app.restApiRoot + '/admin/official-actions/:officialActionID/publish').put(officialActions.publishForAdmin);


  /*------------------------------------------  official action site routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/site/official-actions/:officialActionID').get(officialActions.findOneForSite);

  /*------------------------------------------  official action mobile routes  -----------------------------------------------*/
  app.route(config.app.restApiRoot + '/official-actions').get(officialActions.listForMobile);

  app.param('officialActionID', officialActions.officialActionByID);

};
