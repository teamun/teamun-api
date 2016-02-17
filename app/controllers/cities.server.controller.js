'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  City = mongoose.model('City');

exports.list = function(req, res) {
  City.find(function(err, cities) {
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
        data: {cities: cities}
      });
    }
  });
};


exports.findOne = function(req, res) {
  City.findOne({
    _id: req.params.cityID
  }).exec(function(err, city) {
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
        data: {city: city}
      });
    }
  });
};
