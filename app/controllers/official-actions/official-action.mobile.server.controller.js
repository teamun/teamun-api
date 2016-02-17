'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  utilsValidation = require('../../utils/paginate/utilsValidation.js'),
  paginate = require('node-paginate-anything'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  OfficialActionType = require('../../utils/enum/officialActionType.js'),
  OfficialActionStatus = require('../../utils/enum/officialActionStatus.js'),
  RecruitGroupStatus = require('../../utils/enum/recruitGroupStatus.js'),
  OfficialAction = mongoose.model('OfficialAction'),
  RecruitGroup = mongoose.model('RecruitGroup');


exports.listForMobile = function(req, res) {
  //如果没有传递页码参数返回信息
  if(!req.query.page || req.query.page < 0){
    return res.json({
      ret: -1,
      code: ErrorCode.PAGINATE_ERROR.code,
      msg: ErrorCode.PAGINATE_ERROR.desc
    });
  }
  req.headers.range = utilsValidation.getRange(req.query.page);
  req.headers['range-unit'] = 'items';
  var hasmore = true;
  OfficialAction.count({}, function(err, count){
    var range = utilsValidation.assertValidRange(req.headers.range);
    var limit = (range.rangeTo - range.rangeFrom) + 1;
    var queryParameters = paginate(req, res, count, limit);
    //如果queryParamters 为 undefined 说明传参页码错误
    if(!queryParameters) {
      return res.json({
        ret: -1,
        code: ErrorCode.PAGINATE_ERROR.code,
        msg: ErrorCode.PAGINATE_ERROR.desc
      });
    }
    //如果limit 小于10，或rangeTo = count 说明后面没有更多数据
    if(queryParameters.limit < 10 || (range.rangeTo + 1 == count)) {
      hasmore = false;
    }
    if(count > 0) {
      OfficialAction.find({}, 'title poster membersCount type status source url publishTime')
        .sort({
          'meta.createAt': -1
        })
        .limit(queryParameters.limit)
        .skip(queryParameters.skip)
        .exec(function(err, officialActions) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          } else {
            //计算每个活动总的报名人数 membersCount
            for (var i = 0; i < officialActions.length; i++) {
              if (officialActions[i].recruitGroups) {
                for (var j = 0; j < officialActions[i].recruitGroups.length; j++) {
                  if(officialActions[i].recruitGroups[j].users) {
                    officialActions[i].membersCount += officialActions[i].recruitGroups[j].users.length;
                  };
                };
              };
            };
            return res.json({
              ret: 1,
              msg: ErrorCode.SUCCESS.desc,
              data: {
                officialActions: officialActions,
                hasmore: hasmore,
                statusMap: OfficialActionStatus.statusCodeMap,
                typeMap: OfficialActionType.typeCodeMap
              }
            });
          }
        });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {
          officialActions: null
        }
      });
    }
  });
};