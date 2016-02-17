'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  OfficialActionStatus = require('../../utils/enum/officialActionStatus.js'),
  OfficialAction = mongoose.model('OfficialAction');


exports.createForAdmin = function(req, res) {
  var officialAction = new OfficialAction(req.body);

  officialAction.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      OfficialAction.update({
        _id: officialAction._id
      }, {
        $set: {
          url: 'http://www.teamun.com/official-action-detail/' + officialAction._id
        }
      }, function(err) {
        if (err) {
          return res.json({
            ret: -1,
            code: ErrorCode.DATABASE_ERROR.code,
            msg: errorHandler.getErrorMessage(err)
          });
        }
      });
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {officialAction: officialAction}
      });
    }
  });
};


exports.listForAdmin = function(req, res) {
  OfficialAction.find(function(err, actions) {
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
        data: {actions: actions}
      });
    }
  });
};


exports.findOneForAdmin = function(req, res) {
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: {action: req.action}
  });
};


exports.updateForAdmin = function(req, res) {
  var action = req.action;
  action = _.extend(action, req.body);
  action.save(function(err) {
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
        data: {action: action}
      });
    }
  });
};


exports.deleteForAdmin = function(req, res) {
  var action = req.action;

  action.remove(function(err) {
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
        data: {action: action}
      });
    }
  });
};


exports.publishForAdmin = function(req, res) {
  var action = req.action;
  action.status = OfficialActionStatus.statusCode.ACTION_PUBLISHED.code;
  action.save(function(err) {
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
          action: action
        }
      });
    }
  });
};


