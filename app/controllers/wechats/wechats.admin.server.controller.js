'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  utilsValidation = require('../../utils/paginate/utilsValidation.js'),
  mongoose = require('mongoose'),
  paginate = require('node-paginate-anything'),
  WechatActivity = mongoose.model('WechatActivity'),
  WechatActivityJoinRecord = mongoose.model('WechatActivityJoinRecord');


exports.adminActivities = function(req, res) {
  WechatActivity.count({}, function( err, count){

    var range = utilsValidation.assertValidRange(req.headers.range);
    var limit = (range.rangeTo - range.rangeFrom) + 1;
    var queryParameters = paginate(req, res, count, limit);

    if(count > 0) {
      WechatActivity.find({})
        .sort({'meta.createAt': -1})
        .limit(queryParameters.limit)
        .skip(queryParameters.skip)
        .exec(function(err, activities) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json({
            success: true,
            activities: activities
          });
        }
      });
    } else {
      res.json({
        success: true,
        activities: null
      });
    } 
  });
};


exports.adminGetJoinList = function(req, res) {
  WechatActivityJoinRecord.count({activity: req.query.activity_id}, function( err, count){

    var range = utilsValidation.assertValidRange(req.headers.range);
    var limit = (range.rangeTo - range.rangeFrom) + 1;
    var queryParameters = paginate(req, res, count, limit);

    WechatActivityJoinRecord.find({activity: req.query.activity_id})
      .sort({'meta.createAt': -1})
      .limit(queryParameters.limit)
      .skip(queryParameters.skip)
      .exec(function(err, joinRecords) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          success: true,
          joinRecords: joinRecords
        });
      }
    });
  });
};