'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  OfficialAction = mongoose.model('OfficialAction');


/**
 * OfficialAction middleware
 */
exports.officialActionByID = function(req, res, next, id) {
  OfficialAction.findById(id).exec(function(err, action) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    }
    if (!action) {
      return res.json({
        ret: -1,
        code: ErrorCode.OFFICIAL_ACTION_NOT_EXIST.code,
        msg: ErrorCode.OFFICIAL_ACTION_NOT_EXIST.desc
      });
    }
    req.action = action;
    next();
  });
};
