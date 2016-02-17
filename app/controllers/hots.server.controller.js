'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  HotCategory = require('../utils/enum/hotCategory.js'),
  Hot = mongoose.model('Hot');


exports.listForMobile = function(req, res) {
  Hot.find({type: 'app'})
  .sort({
    'meta.createAt': -1
  })
  .limit(5)
  .exec(function(err, hots) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {
          hots: hots,
          hotCategoryMap: HotCategory.categoryCodeMap
        }
      });
    }
  });
};


exports.listForSite = function(req, res) {
  Hot.find({type: 'site'})
  .sort({
    'meta.createAt': -1
  })
  .limit(5)
  .exec(function(err, hots) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {
          hots: hots,
          hotCategoryMap: HotCategory.categoryCodeMap
        }
      });
    }
  });
};


exports.createForAdmin = function(req, res) {
  var hot = new Hot(req.body);

  hot.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {hot: hot}
      });
    }
  });
};


exports.listForAdmin = function(req, res) {
  Hot.find(function(err, hots) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {
          hots: hots,
          hotCategoryMap: HotCategory.categoryCodeMap
        }
      });
    }
  });
};


exports.findOneForAdmin = function(req, res) {
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: {
      hot: req.hot,
      hotCategoryMap: HotCategory.categoryCodeMap
    }
  });
};


exports.updateForAdmin = function(req, res) {
  var hot = req.hot;
  hot = _.extend(hot, req.body);
  hot.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {hot: hot}
      });
    }
  });
};


exports.deleteForAdmin = function(req, res) {
  var hot = req.hot;

  hot.remove(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {hot: hot}
      });
    }
  });
};

/**
 * Hot middleware
 */
exports.hotByID = function(req, res, next, id) {
  Hot.findById(id).exec(function(err, hot) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    }
    if (!hot) {
      return res.json({
        ret: -1,
        code: ErrorCode.HOT_NOT_EXIST.code,
        msg: ErrorCode.HOT_NOT_EXIST.desc
      });
    }
    req.hot = hot;
    next();
  });
};
