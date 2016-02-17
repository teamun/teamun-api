'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  OfficialActionStatus = require('../../utils/enum/officialActionStatus.js'),
  RecruitGroupStatus = require('../../utils/enum/recruitGroupStatus.js'),
  OfficialAction = mongoose.model('OfficialAction'),
  RecruitGroup = mongoose.model('RecruitGroup'),
  User = mongoose.model('User');


var findOneBody = function(req, res, user) {
  OfficialAction.findOne({_id: req.params.officialActionID})
  .populate({path: 'recruitGroups',options: {sort: {'meta.createAt': -1}}})
  .exec(function(err, action) {
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
    } else {
      //判断当前用户是否加入该活动任意分组，如果已加入标识: isJoin = true
      if (user) {
        for (var i = 0; i < action.recruitGroups.length; i++) {
          if (action.recruitGroups[i].users.indexOf(user._id) >= 0) {
            action.recruitGroups[i].isJoin = true;
          } else {
            action.recruitGroups[i].isJoin = false;
          }
          action.membersCount += action.recruitGroups[i].users.length;
        };
      };

      //判断任何分组中有任意一组报名时间小于当前时间
      for (var i = 0; i < action.recruitGroups.length; i++) {
        if (new Date() > action.recruitGroups[i].signTime && action.recruitGroups[i].status === RecruitGroupStatus.statusCode.RECRUIT_GROUP_SIGN_UP.code && action.status === OfficialActionStatus.statusCode.ACTION_PUBLISHED.code) {
          //如果该分组报名时间小于当前时间 并且 活动状态为未开始:0 ,则更改分组状态为: 1 - 报名中
          RecruitGroup.update({
            _id: action.recruitGroups[i]._id
          }, {
            $set: {
              status: RecruitGroupStatus.statusCode.RECRUIT_GROUP_SIGN_UP_ING.code
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
        };

        //如果该分组报名截至时间小于当前时间并且当前状态不等于已结束 ,则更改分组状态为: 3 - 已结束
        if (new Date() > action.recruitGroups[i].deadlineTime && action.recruitGroups[i].status !== RecruitGroupStatus.statusCode.RECRUIT_GROUP_SIGN_UP_CLOSE.code) {
          RecruitGroup.update({
            _id: action.recruitGroups[i]._id
          }, {
            $set: {
              status: RecruitGroupStatus.statusCode.RECRUIT_GROUP_SIGN_UP_CLOSE.code
            }
          }, function(err) {
            if (err) {
              return res.json({
                ret: -1,
                code: ErrorCode.DATABASE_ERROR.code,
                msg: errorHandler.getErrorMessage(err)
              });
            };
          });
        };
      };

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

exports.findOneForSite = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if (token) {
    //先进行身份验证
    User.findOne({
      token: token
    }).exec(function(err, user) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      };
      if (!user) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACCESS_TOKEN_EXPIRED.code,
          msg: ErrorCode.ACCESS_TOKEN_EXPIRED.desc
        });
      } else {
        findOneBody(req, res, user);
      }
    });
  } else {
    var user = req.user;
    findOneBody(req, res, user);
  }
};
