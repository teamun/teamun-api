'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  utilsValidation = require('../utils/paginate/utilsValidation.js'),
  paginate = require('node-paginate-anything'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  User = mongoose.model('User'),
  Notification = mongoose.model('Notification'),
  NotificationBodyType = require('../utils/enum/notificationBodyType.js'),
  NotificationType = require('../utils/enum/notificationType.js'),
  Notification = mongoose.model('Notification'),
  NotificationBody = mongoose.model('NotificationBody');


exports.list = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if (token) {
    //先进行身份验证
    User.findOne({token: token})
    .exec(function(err, user) {
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
        Notification.count({}, function(err, count){
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
            Notification.find({user: user._id}, 'activity officialAction notificationBodys unreadcount type lastmsg')
            .populate('activity', 'name poster status')
            .populate('officialAction', 'title poster')
            .populate('notificationBodys', 'isread')
            .sort({
              'meta.createAt': -1
            })
            .limit(queryParameters.limit)
            .skip(queryParameters.skip)
            .exec(function(err, notifications) {

              if (err) {
                return res.json({
                  ret: -1,
                  code: ErrorCode.DATABASE_ERROR.code,
                  msg: errorHandler.getErrorMessage(err)
                });
              } else {
                //计算每个消息的未读数
                for (var i = 0; i < notifications.length; i++) {
                  var unreadcount = 0;
                  for (var j = 0; j < notifications[i].notificationBodys.length; j++) {
                    if(notifications[i].notificationBodys[j].isread === false) {
                      unreadcount++;
                    }
                  };
                  notifications[i].unreadcount = unreadcount;
                };
                return res.json({
                  ret: 1,
                  msg: ErrorCode.SUCCESS.desc,
                  data: {
                    hasmore: hasmore,
                    notifications: notifications,
                    typeMap: NotificationType.notificationCodeMap
                  }
                });
              }
            });
          } else {
            return res.json({
              ret: 1,
              msg: ErrorCode.SUCCESS.desc,
              data: {
                notifications: null
              }
            });
          }
        });
      }
    });
  }
};


exports.findOne = function(req, res) {
  Notification.findOne({_id: req.params.notificationID}, 'activity officialAction notificationBodys type')
  .populate('activity', 'name')
  .populate('officialAction', 'title')
  .populate({path: 'notificationBodys', select: 'type parentType title content meta.createAt isread', options:{sort: {'meta.createAt': -1}}})
  .exec(function(err, notification) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      //遍历所有未读消息更新为已读状态
      for (var i = 0; i < notification.notificationBodys.length; i++) {
        if(!notification.notificationBodys[i].isread) {
          NotificationBody.update({
            _id: notification.notificationBodys[i]._id
          }, {
            $set: {
              isread: true
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
      };
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {
          notification: notification,
          parentType: NotificationType.notificationCodeMap,
          typeMap: NotificationBodyType.notificationBodyCodeMap
        }
      });
    }
  });
};


exports.unreadTotalCount = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if (token) {
    User.findOne({token: token})
    .exec(function(err, user) {
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
        Notification.find({user: user._id}, 'notificationBodys')
        .populate('notificationBodys', 'isread')
        .exec(function(err, notifications) {
          //计算每个消息的未读数
          var totalcount = 0;
          for (var i = 0; i < notifications.length; i++) {
            var unreadcount = 0;
            for (var j = 0; j < notifications[i].notificationBodys.length; j++) {
              if(!notifications[i].notificationBodys[j].isread) {
                unreadcount++;
              }
            };
            notifications[i].unreadcount = unreadcount;
            totalcount += notifications[i].unreadcount;
          };
          return res.json({
            ret: 1,
            msg: ErrorCode.SUCCESS.desc,
            data: totalcount
          });
        });
      }
    });
  };
};
