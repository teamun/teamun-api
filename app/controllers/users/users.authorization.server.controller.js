'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  errorHandler = require('../errors.server.controller.js'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  User = mongoose.model('User');


exports.userByID = function(req, res, next, id) {
  User.findOne({
    _id: id
  }).exec(function(err, user) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    }
    if (!user) {
      return res.json({
        ret: -1,
        code: ErrorCode.USER_NOT_EXIST.code,
        msg: ErrorCode.USER_NOT_EXIST.desc
      });
    }
    if (req.isAuthenticated()) {
      req.user = user;
    }
    next();
  });
};


/**
 * 登陆权限路由中间件
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(res.statusCode).send({
      ret: -1,
      code: ErrorCode.USER_NOT_LOGIN.code,
      msg: ErrorCode.USER_NOT_LOGIN.desc
    });
  }
  next();
};
