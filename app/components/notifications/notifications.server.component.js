'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../../controllers/errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  Activity = mongoose.model('Activity'),
  ActivityGroup = mongoose.model('ActivityGroup'),
  NotificationBodyType = require('../../utils/enum/notificationBodyType.js'),
  NotificationType = require('../../utils/enum/notificationType.js'),
  Notification = mongoose.model('Notification'),
  NotificationBody = mongoose.model('NotificationBody');


/**
 * 创建活动消息体
 */
var createActivityNotificationBody = function(req, res, notification, activityGroup, type, title, parentType, content) {
  var notificationBody = new NotificationBody();
  notificationBody.notification = notification._id;
  notificationBody.activity = activityGroup.activity;
  notificationBody.type = type;
  notificationBody.title = title;
  notificationBody.parentType = parentType;
  notificationBody.content = content;
  notificationBody.save(function(err) {
    if (err) {
      // return res.json({
      //   ret: -1,
      //   code: ErrorCode.DATABASE_ERROR.code,
      //   msg: errorHandler.getErrorMessage(err)
      // });
    } else {
      notification.notificationBodys.push(notificationBody._id);
      //更新父消息包含消息体数组
      Notification.update({
        _id: notification._id
      }, {
        $set: {
          lastmsg: content,
          notificationBodys: notification.notificationBodys
        }
      }, function(err) {
        if (err) {
          // return res.json({
          //   ret: -1,
          //   code: ErrorCode.DATABASE_ERROR.code,
          //   msg: errorHandler.getErrorMessage(err)
          // });
        }
      });
    }
  });

};


/**
 * 创建动态消息体
 */
var createOfficialActionNotificationBody = function(req, res, notification, recruitGroup, type, title, parentType, content) {
  var notificationBody = new NotificationBody();
  notificationBody.notification = notification._id;
  notificationBody.officialAction = recruitGroup.officialAction;
  notificationBody.type = type;
  notificationBody.title = title;
  notificationBody.parentType = parentType;
  notificationBody.content = content;
  notificationBody.save(function(err) {
    if (err) {
      // return res.json({
      //   ret: -1,
      //   code: ErrorCode.DATABASE_ERROR.code,
      //   msg: errorHandler.getErrorMessage(err)
      // });
    } else {
      notification.notificationBodys.push(notificationBody._id);
      //更新父消息包含消息体数组
      Notification.update({
        _id: notification._id
      }, {
        $set: {
          lastmsg: content,
          notificationBodys: notification.notificationBodys
        }
      }, function(err) {
        if (err) {
          // return res.json({
          //   ret: -1,
          //   code: ErrorCode.DATABASE_ERROR.code,
          //   msg: errorHandler.getErrorMessage(err)
          // });
        }
      });
    }
  });
};


/**
 * 创建活动成功提醒
 */
exports.sendCreateActivityNotificationToSelf = function(req, res, activityGroup, user) {
  var notification = new Notification();
  notification.activity = activityGroup.activity;
  notification.user = user._id;
  notification.lastmsg = '发布活动成功，分享活动，和伙伴们快乐运动吧！';
  notification.type = NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code;

  notification.save(function(err) {
    if (err) {
      // return res.json({
      //   ret: -1,
      //   code: ErrorCode.DATABASE_ERROR.code,
      //   msg: errorHandler.getErrorMessage(err)
      // });
    } else {
      //创建消息体
      createActivityNotificationBody(
        req,
        res,
        notification,
        activityGroup,
        NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_SUCCESS.code,
        NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_SUCCESS.desc,
        NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
        '发布活动成功，分享活动，和伙伴们快乐运动吧！');
    }
  });
};


/**
 * 加入活动成功提醒（发送给加入人自己）
 */
exports.sendJoinActivityNotificationToSelf = function(req, res, activityGroup, user) {
  Notification.findOne({ activity: activityGroup.activity, user: user._id })
    .exec(function(err, notification) {
      if (err) {
        // return res.json({
        //   ret: -1,
        //   code: ErrorCode.DATABASE_ERROR.code,
        //   msg: errorHandler.getErrorMessage(err)
        // });
      };
      if (!notification) {
        var notification = new Notification();
        notification.activity = activityGroup.activity;
        notification.user = user._id;
        notification.lastmsg = '加入活动成功，分享活动，和伙伴们快乐运动吧！';
        notification.type = NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code;

        notification.save(function(err) {
          if (err) {
            // return res.json({
            //   ret: -1,
            //   code: ErrorCode.DATABASE_ERROR.code,
            //   msg: errorHandler.getErrorMessage(err)
            // });
          } else {
            createActivityNotificationBody(
              req,
              res,
              notification,
              activityGroup,
              NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.code,
              NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.desc,
              NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
              '加入活动成功，分享活动，和伙伴们快乐运动吧！');
          }
        });
      } else {
        //创建消息体
        createActivityNotificationBody(
          req,
          res,
          notification,
          activityGroup,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.code,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.desc,
          NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
          '加入活动成功，分享活动，和伙伴们快乐运动吧！');
      }
    });
};


/**
 * 加入活动成功提醒（发送给该活动领队）
 */
exports.sendJoinActivityNotificationToCaptain = function(req, res, activityGroup, user) {
  Activity.findOne({ _id: activityGroup.activity }, 'captain')
    .populate('captain', 'nickname')
    .exec(function(err, activity) {
      if (err) {
        // return res.json({
        //   ret: -1,
        //   code: ErrorCode.DATABASE_ERROR.code,
        //   msg: errorHandler.getErrorMessage(err)
        // });
      } else {
        Notification.findOne({ activity: activityGroup.activity, user: activity.captain._id })
          .exec(function(err, notification) {
            if (err) {
              // return res.json({
              //   ret: -1,
              //   code: ErrorCode.DATABASE_ERROR.code,
              //   msg: errorHandler.getErrorMessage(err)
              // });
            };
            if (notification) {
              createActivityNotificationBody(
                req,
                res,
                notification,
                activityGroup,
                NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.code,
                NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.desc,
                NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
                '【' + user.nickname + '】加入了你的活动');
            } else {
              var notification = new Notification();
              notification.activity = activityGroup.activity;
              notification.user = activity.captain._id;
              notification.lastmsg = '【' + user.nickname + '】加入了你的活动';
              notification.type = NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code;
              notification.save(function(err) {
                if (err) {

                }

                createActivityNotificationBody(
                  req,
                  res,
                  notification,
                  activityGroup,
                  NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.code,
                  NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.desc,
                  NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
                  '【' + user.nickname + '】加入了你的活动');
              });
            }
          });
      }
    });
};


/**
 * 活动踢人发出通知逻辑(发送给自己)
 */
exports.sendKickoutActivityNotificationToSelf = function(req, res, activityGroup, user, member) {
  Notification.findOne({ activity: activityGroup.activity, user: user._id })
    .exec(function(err, notification) {
      if (err) {
        // return res.json({
        //   ret: -1,
        //   code: ErrorCode.DATABASE_ERROR.code,
        //   msg: errorHandler.getErrorMessage(err)
        // });
      };
      if (!notification) {

      } else {
        //创建消息体
        createActivityNotificationBody(
          req,
          res,
          notification,
          activityGroup,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.code,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.desc,
          NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
          '【' + member.nickname + '】已被你移出了活动');
      }
    });
};


/**
 * 活动踢人发出通知逻辑(发送给被踢人)
 */
exports.sendKickoutActivityNotificationToMember = function(req, res, activityGroup, member) {
  Notification.findOne({ activity: activityGroup.activity, user: member.userId })
    .exec(function(err, notification) {
      if (err) {
        // return res.json({
        //   ret: -1,
        //   code: ErrorCode.DATABASE_ERROR.code,
        //   msg: errorHandler.getErrorMessage(err)
        // });
      };
      if (!notification) {

      } else {
        //创建消息体
        createActivityNotificationBody(
          req,
          res,
          notification,
          activityGroup,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.code,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_APPLY.desc,
          NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
          '您已被领队移出了活动');
      }
    });
};


/**
 * 活动时间变更提醒（发送给所有该活动参与人）
 */
exports.sendUpdateActivityTimeNotificationToEveryBody = function(req, res, activity, startTimeStr) {
  Activity.deepPopulate(activity, 'activityGroups', {}, function(err, activity) {
    Activity.deepPopulate(activity.activityGroups, 'users', {}, function(err, activityGroups) {
      for (var i = 0; i < activityGroups.length; i++) {
        for (var j = 0; j < activityGroups[i].users.length; j++) {
          var activityGroup = activityGroups[i];
          Notification.findOne({ activity: activity._id, user: activityGroups[i].users[j] })
            .exec(function(err, notification) {
              if (err) {
                // return res.json({
                //   ret: -1,
                //   code: ErrorCode.DATABASE_ERROR.code,
                //   msg: errorHandler.getErrorMessage(err)
                // });
              };
              if (!notification) {

              } else {
                //创建消息体
                createActivityNotificationBody(
                  req,
                  res,
                  notification,
                  activityGroup,
                  NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_NOTIFY.code,
                  NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_NOTIFY.desc,
                  NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
                  '最新活动开始时间:' + startTimeStr);
              };
            });
        };
      };
    });
  });
};


/**
 * 活动地点变更提醒（发送给所有该活动参与人）
 */
exports.sendUpdateActivityLocationNotificationToEveryBody = function(req, res, activity, location) {
  Activity.deepPopulate(activity, 'activityGroups', {}, function(err, activity) {
    Activity.deepPopulate(activity.activityGroups, 'users', {}, function(err, activityGroups) {
      for (var i = 0; i < activityGroups.length; i++) {
        for (var j = 0; j < activityGroups[i].users.length; j++) {
          var activityGroup = activityGroups[i];
          Notification.findOne({ activity: activity._id, user: activityGroups[i].users[j] })
            .exec(function(err, notification) {
              if (err) {
                // return res.json({
                //   ret: -1,
                //   code: ErrorCode.DATABASE_ERROR.code,
                //   msg: errorHandler.getErrorMessage(err)
                // });
              };
              if (!notification) {

              } else {
                //创建消息体
                createActivityNotificationBody(
                  req,
                  res,
                  notification,
                  activityGroup,
                  NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_NOTIFY.code,
                  NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_ACTIVITY_NOTIFY.desc,
                  NotificationType.notificationCode.NOTIFICATION_ACTIVITY.code,
                  '最新活动地点变更:' + location);
              };
            });
        };
      };
    });
  });
};


/**
 * 加入招募动态成功提醒（发送给加入人自己）
 */
exports.sendJoinOfficialActionNotificationToSelf = function(req, res, recruitGroup, user) {
  Notification.findOne({ officialAction: recruitGroup.officialAction, user: user._id })
    .exec(function(err, notification) {
      if (err) {
        // return res.json({
        //   ret: -1,
        //   code: ErrorCode.DATABASE_ERROR.code,
        //   msg: errorHandler.getErrorMessage(err)
        // });
      };
      if (!notification) {
        var notification = new Notification();
        notification.officialAction = recruitGroup.officialAction;
        notification.user = user._id;
        notification.lastmsg = '【' + recruitGroup.officialAction.title + '】加入成功！';
        notification.type = NotificationType.notificationCode.NOTIFICATION_OFFICIAL_ACTION.code;

        notification.save(function(err) {
          if (err) {
            // return res.json({
            //   ret: -1,
            //   code: ErrorCode.DATABASE_ERROR.code,
            //   msg: errorHandler.getErrorMessage(err)
            // });
          } else {
            createOfficialActionNotificationBody(
              req,
              res,
              notification,
              recruitGroup,
              NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_OFFICIAL_ACTION_APPLY.code,
              NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_OFFICIAL_ACTION_APPLY.desc,
              NotificationType.notificationCode.NOTIFICATION_OFFICIAL_ACTION.code,
              '【' + recruitGroup.officialAction.title + '】加入成功！');
          }
        });
      } else {
        //创建消息体
        createOfficialActionNotificationBody(
          req,
          res,
          notification,
          recruitGroup,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_OFFICIAL_ACTION_APPLY.code,
          NotificationBodyType.notificationBodyCode.NOTIFICATION_BODY_OFFICIAL_ACTION_APPLY.desc,
          NotificationType.notificationCode.NOTIFICATION_OFFICIAL_ACTION.code,
          '【' + recruitGroup.officialAction.title + '】加入成功！');
      }
    });
};
