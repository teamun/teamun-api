'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  ActivityGroup = mongoose.model('ActivityGroup');

/**
 * Activity Group middleware
 */
exports.activityGroupByID = function(req, res, next, id) {
  ActivityGroup.findById(id).exec(function(err, activityGroup) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    }
    if (!activityGroup) {
      return res.json({
        ret: -1,
        code: ErrorCode.ACTIVITY_GROUP_NOT_EXIST.code,
        msg: ErrorCode.ACTIVITY_GROUP_NOT_EXIST.desc
      });
    }
    // if (err) return next(err);
    // if (!activity) return next(new Error('Failed to load activity ' + id));
    req.activityGroup = activityGroup;
    next();
  });
};