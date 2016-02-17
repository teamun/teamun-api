'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Team = mongoose.model('Team'),
  Activity = mongoose.model('Activity');


exports.counts = function(req, res) {
  User.count({
    'roles': {
      '$in': ['captain', 'member', 'normal']
    }
  }, function(err, userCount) {
    if (err) {
      return res.json({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      Team.count(function(err, teamCount) {
        if (err) {
          return res.json({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          Activity.count(function(err, activityCount) {
            if (err) {
              return res.json({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json({
                success: true,
                userCount: userCount,
                teamCount: teamCount,
                activityCount: activityCount
              });
            }
          });
        }
      });
    }
  });
};

