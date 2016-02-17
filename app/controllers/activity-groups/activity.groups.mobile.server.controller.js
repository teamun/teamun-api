'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  ActivityGroupStatus = require('../../utils/enum/activityGroupStatus.js'),
  ActivityGroup = mongoose.model('ActivityGroup'),
  Activity = mongoose.model('Activity'),
  User = mongoose.model('User'),
  GroupMembers = mongoose.model('GroupMembers'),
  NotificationComponent = require('../../components/notifications/notifications.server.component.js');


exports.membersForMobile = function(req, res) {

  ActivityGroup.find({activity: req.params.activityID}, 'name users')
  .populate('users', 'nickname avatar mobile realname idcard isSafe')
  .exec(function(err, groups){

    var member_array = [];
    Activity.findOne({_id: req.params.activityID}, 'captain')
    .populate('captain', 'nickname avatar mobile realname idcard isSafe')
    .exec(function(err, activity){

      //创建成员实体模板
      var captain = new GroupMembers();
      captain.userId = activity.captain._id;
      captain.mobile = activity.captain.mobile;
      captain.nickname = activity.captain.nickname;
      captain.avatar = activity.captain.avatar;
      captain.realname = activity.captain.realname;
      captain.idcard = activity.captain.idcard;
      captain.isSafe = activity.captain.isSafe;
      captain.isCaptain = true;
      captain.activityId = req.params.activityID;
      member_array.push(captain);
      var captainId = activity.captain._id;

      //拼装成员列表结构
      for (var i = 0; i < groups.length; i++) {
        for (var j = 0; j < groups[i].users.length; j++) {
          if(!_.isEqual(captainId, groups[i].users[j]._id)) {
            var members = new GroupMembers();
            members.userId = groups[i].users[j]._id;
            members.mobile = groups[i].users[j].mobile;
            members.nickname = groups[i].users[j].nickname;
            members.avatar = groups[i].users[j].avatar;
            members.realname = groups[i].users[j].realname;
            members.idcard = groups[i].users[j].idcard;
            members.isSafe = groups[i].users[j].isSafe;
            
            members.groupId = groups[i]._id;
            members.groupName = groups[i].name;
            members.activityId = req.params.activityID;
            member_array.push(members);
          }
        };
      };
      res.json({
        ret: 1,
        msf: ErrorCode.SUCCESS.msg,
        data: member_array
      });
    });
  });
};


exports.joinForMobile = function(req, res) {
  var activityGroup = req.activityGroup;
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if(token) {
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
      }
      if (!user) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACCESS_TOKEN_EXPIRED.code,
          msg: ErrorCode.ACCESS_TOKEN_EXPIRED.desc
        });
      };
      if(activityGroup.users.indexOf(user._id) >= 0) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACTIVITY_GROUP_ALREADY_JOINED.code,
          msg: ErrorCode.ACTIVITY_GROUP_ALREADY_JOINED.desc
        });
      } else {
        //如果活动分组状态为已结束则返回结束状态
        if(!activityGroup.status == ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.code) {
          return res.json({
            ret: -1,
            code: ErrorCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.code,
            msg: ErrorCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.desc
          });
        } else {
          //如果当前时间大于报名截至时间则更新活动状态为: 3 - 已结束
          if(new Date() > activityGroup.deadlineTime) {
            ActivityGroup.update({
              _id: activityGroup._id
            }, {
              $set: {
                status: ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.code
              }
            }, function(err) {
              if (err) {
                return res.json({
                  ret: -1,
                  code: ErrorCode.DATABASE_ERROR.code,
                  msg: errorHandler.getErrorMessage(err)
                });
              } else {
                return res.json({
                  ret: -1,
                  code: ErrorCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.code,
                  msg: ErrorCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.desc
                });
              }
            });
          } else {
            //如果当前分组状态为报名中才可以报名
            if(activityGroup.status == ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_ING.code) {

              //判断该分组报名人数是否已达上限 或者 numLimit ＝ 0 则为不限制人数
              if(activityGroup.users.length < activityGroup.numLimit || activityGroup.numLimit == 0) {
                activityGroup.users.push(user._id);
                activityGroup.save(function(err) {
                  if (err) {
                    return res.json({
                      ret: -1,
                      code: ErrorCode.DATABASE_ERROR.code,
                      msg: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    //加入活动发出通知逻辑(发送给自己)
                    NotificationComponent.sendJoinActivityNotificationToSelf(req, res, activityGroup, user);
                    //加入活动发出通知逻辑(发送给活动领队)
                    NotificationComponent.sendJoinActivityNotificationToCaptain(req, res, activityGroup, user);

                    return res.json({
                      ret: 1,
                      code: ErrorCode.SUCCESS.code,
                      msg: ErrorCode.SUCCESS.desc,
                    });
                  }
                });

                //更新与自己相关的活动
                user.activities.push(activityGroup.activity);
                User.update({
                  _id: user._id
                }, {
                  $set: {
                    activities: user.activities
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
              } else {
                //更新报名人数已满
                ActivityGroup.update({
                  _id: activityGroup._id
                }, {
                  $set: {
                    status: ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_FULL.code
                  }
                }, function(err) {
                  if (err) {
                    return res.json({
                      ret: -1,
                      code: ErrorCode.DATABASE_ERROR.code,
                      msg: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    return res.json({
                      ret: -1,
                      code: ErrorCode.ACTIVITY_GROUP_SIGN_UP_FULL.code,
                      msg: ErrorCode.ACTIVITY_GROUP_SIGN_UP_FULL.desc
                    });
                  }
                });
              }
            } else {
              return res.json({
                ret: -1,
                code: ErrorCode.ACTIVITY_GROUP_JOIN_NOT_STARTED.code,
                msg: ErrorCode.ACTIVITY_GROUP_JOIN_NOT_STARTED.desc
              });
            }
          }
        }
      }
    });
  }
};


exports.quitForMobile = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if(token) {
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
      }
      if (!user) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACCESS_TOKEN_EXPIRED.code,
          msg: ErrorCode.ACCESS_TOKEN_EXPIRED.desc
        });
      } else {
        var activityGroup = req.activityGroup;
        if(activityGroup.users.indexOf(user._id) >= 0) {
          activityGroup.users = activityGroup.users.splice(activityGroup.users, activityGroup.users.indexOf(user._id));
          activityGroup.save(function(err) {
            if (err) {
              return res.json({
                ret: -1,
                code: ErrorCode.DATABASE_ERROR.code,
                msg: errorHandler.getErrorMessage(err)
              });
            } else {
              return res.json({
                ret: 1,
                code: ErrorCode.SUCCESS.code,
                msg: ErrorCode.SUCCESS.desc,
              });
            }
          });

          //更新与自己相关的活动
          if(user.activities.indexOf(activityGroup.activity) >= 0) {
            user.activities = user.activities.splice(user.activities, user.activities.indexOf(activityGroup.activity));
            User.update({
              _id: user._id
            }, {
              $set: {
                activities: user.activities
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
        } else {
          return res.json({
            ret: -1,
            code: ErrorCode.ACTIVITY_GROUP_ALREADY_QUIT.code,
            msg: ErrorCode.ACTIVITY_GROUP_ALREADY_QUIT.desc
          });
        }
      }
    });
  }
};


exports.kickoutForMobile = function(req, res) {
  var member = JSON.parse(req.body.member);
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if(token) {
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
      }
      if (!user) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACCESS_TOKEN_EXPIRED.code,
          msg: ErrorCode.ACCESS_TOKEN_EXPIRED.desc
        });
      } else {
        Activity.findOne({
          _id: member.activityId
        })
        .populate('captain', 'nickname')
        .exec(function(err, activity) {
          //判断是否为该活动的领队
          if(!_.isEqual(activity.captain._id, user._id)) {
            return res.json({
              ret: -1,
              code: ErrorCode.ACTIVITY_HAVA_NOT_CAPTAIN_PERMISSION.code,
              msg: ErrorCode.ACTIVITY_HAVA_NOT_CAPTAIN_PERMISSION.desc
            });
          } else {
            var activityGroup = req.activityGroup;
            if(activityGroup.users.indexOf(member.userId) >= 0) {
              activityGroup.users = activityGroup.users.splice(activityGroup.users, activityGroup.users.indexOf(member.userId));
              activityGroup.save(function(err) {
                if (err) {
                  return res.json({
                    ret: -1,
                    code: ErrorCode.DATABASE_ERROR.code,
                    msg: errorHandler.getErrorMessage(err)
                  });
                } else {
                  //活动踢人发出通知逻辑(发送给自己)
                  NotificationComponent.sendKickoutActivityNotificationToSelf(req, res, activityGroup, user, member);
                  //活动踢人发出通知逻辑(发送给被踢人)
                  NotificationComponent.sendKickoutActivityNotificationToMember(req, res, activityGroup, member);

                  return res.json({
                    ret: 1,
                    code: ErrorCode.SUCCESS.code,
                    msg: ErrorCode.SUCCESS.desc,
                  });
                }
              });

              //更新与自己相关的活动
              User.findOne({
                _id: member.userId
              }).exec(function(err, member) {
                if (err) {
                  return res.json({
                    ret: -1,
                    code: ErrorCode.DATABASE_ERROR.code,
                    msg: errorHandler.getErrorMessage(err)
                  });
                };
                if(member.activities.indexOf(activityGroup.activity) >= 0) {
                  member.activities = member.activities.splice(member.activities, member.activities.indexOf(activityGroup.activity));
                  User.update({
                    _id: member._id
                  }, {
                    $set: {
                      activities: member.activities
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
              });
            } else {
              return res.json({
                ret: -1,
                code: ErrorCode.ACTIVITY_GROUP_ALREADY_QUIT.code,
                msg: ErrorCode.ACTIVITY_GROUP_ALREADY_QUIT.desc
              });
            }
          }
        });
      }
    });
  }
};