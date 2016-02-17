'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('../../controllers/errors.server.controller'),
  mongoose = require('mongoose'),
  ErrorCode = require('../enum/errorCode.js'),
  User = mongoose.model('User');

exports.checkAvailableMobile = function(req, res, mobile) {

	var regx = /^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/;

	if (!mobile || !regx.exec(mobile)) {
    return res.json({
      ret: -1,
      code: ErrorCode.MOBILE_FORMAT_ERROR.code,
      msg: ErrorCode.MOBILE_FORMAT_ERROR.desc
    });
  }

  User.findOne({
    mobile: mobile
  }).exec(function(err, user) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (!user) {
        return res.json({
          ret: 1,
          msg: ErrorCode.MOBILE_AVALIABLE.desc,
          code: ErrorCode.MOBILE_AVALIABLE.code
        });
      } else {
        return res.json({
          ret: -1,
          msg: ErrorCode.MOBILE_ALREADY_EXIST.desc,
          code: ErrorCode.MOBILE_ALREADY_EXIST.code
        });
      }
    }
  });
}


exports.checkAvailableEmail = function(req, res, email) {
  
	var regx = /.+\@.+\..+/;

	if (!email || !regx.exec(email)) {
    return res.json({
      ret: -1,
      code: ErrorCode.EMAIL_FORMAT_ERROR.code,
      msg: ErrorCode.EMAIL_FORMAT_ERROR.desc
    });
  }

  User.findOne({
    email: email
  }).exec(function(err, user) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (!user) {
        return res.json({
          ret: 1,
          msg: ErrorCode.EMAIL_AVALIABLE.desc,
          code: ErrorCode.EMAIL_AVALIABLE.code
        });
      } else {
        return res.json({
          ret: -1,
          msg: ErrorCode.EMAIL_ALREADY_EXIST.desc,
          code: ErrorCode.EMAIL_ALREADY_EXIST.code
        });
      }
    }
  });
}
