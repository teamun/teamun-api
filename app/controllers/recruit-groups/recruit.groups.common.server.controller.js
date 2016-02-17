'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  RecruitGroup = mongoose.model('RecruitGroup');

/**
 * RecruitGroup middleware
 */
exports.recruitGroupByID = function(req, res, next, id) {
  RecruitGroup.findById(id)
  .populate('officialAction', 'title')
  .exec(function(err, recruitGroup) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    }
    if (!recruitGroup) {
      return res.json({
        ret: -1,
        code: ErrorCode.RECRUIT_GROUP_NOT_EXIST.code,
        msg: ErrorCode.RECRUIT_GROUP_NOT_EXIST.desc
      });
    }
    req.recruitGroup = recruitGroup;
    next();
  });
};