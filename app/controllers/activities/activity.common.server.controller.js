'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  Activity = mongoose.model('Activity');

/**
 * Activity middleware
 */
exports.activityByID = function(req, res, next, id) {
  Activity.findById(id)
  .populate('activityGroups', 'users activity')
  .exec(function(err, activity) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    }
    if (!activity) {
      return res.json({
        ret: -1,
        code: ErrorCode.ACTIVITY_NOT_EXIST.code,
        msg: ErrorCode.ACTIVITY_NOT_EXIST.desc
      });
    }
    // if (err) return next(err);
    // if (!activity) return next(new Error('Failed to load activity ' + id));
    req.activity = activity;
    next();
  });
};