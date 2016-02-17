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
  GroupMembers = mongoose.model('GroupMembers'),
  User = mongoose.model('User'),
  NotificationComponent = require('../../components/notifications/notifications.server.component.js');


exports.createForSite = function(req, res) {
  var activityGroup = new ActivityGroup(req.body);
  activityGroup.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      Activity.findOne(activityGroup.activity).exec(function(err, activity) {
        if (err) {
          return res.json({
            ret: -1,
            code: ErrorCode.DATABASE_ERROR.code,
            msg: errorHandler.getErrorMessage(err)
          });
        } else {
          activity.activityGroups.push(activityGroup._id);
          var groups = activity.activityGroups;
          Activity.update({
            _id: activity._id
          }, {
            $set: {
              activityGroups: groups
            }
          }, function(err) {
            if (err) {
              return res.json({
                ret: -1,
                code: ErrorCode.DATABASE_ERROR.code,
                msg: errorHandler.getErrorMessage(err)
              });
            } else {
              activity.activityGroups.push(activityGroup._id);
              return res.json({
                ret: 1,
                msg: ErrorCode.SUCCESS.desc,
                data: {
                  activityGroup: activityGroup
                }
              }); 
            }
          });
        }
      });
    }
  });
};


exports.findOneForSite = function(req, res) {
  ActivityGroup.find({activity: req.params.activityID})
    .sort({'meta.createAt': -1})
    .exec(function(err, activityGroups) {
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
            activityGroups: activityGroups,
            statusMap: ActivityGroupStatus.statusCodeMap
          }
        });
      }
    });
};


exports.findOneForEditForSite = function(req, res) {
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: {
      activityGroup: req.activityGroup
    }
  });
};


exports.updateForSite = function(req, res) {
  var activityGroup = req.activityGroup;
  activityGroup = _.extend(activityGroup, req.body);
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
        msg: ErrorCode.SUCCESS.desc,
        data: {
          activityGroup: activityGroup
        }
      });
    }
  });
};


exports.deleteForSite = function(req, res) {
  var activityGroup = req.activityGroup;
  activityGroup.remove(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {

      Activity.findById(activityGroup.activity).exec(function(err, activity) {
        if (err) {
          return res.json({
            ret: -1,
            code: ErrorCode.DATABASE_ERROR.code,
            msg: errorHandler.getErrorMessage(err)
          });
        } else {
          //删除分组
          var group_array = [];
          group_array = activity.activityGroups;
          for (var i = 0; i < group_array.length; i++) {
            if(group_array[i].toString() == activityGroup._id.toString()) {
              group_array.splice(group_array.indexOf(group_array[i]), 1);
            }
          };
          activity.activityGroups = group_array;
          activity.save(function(err) {
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
                  activityGroup: activityGroup
                }
              });
            }
          });
        }
      });
    }
  });
};


exports.joinForSite = function(req, res) {
  var activityGroup = req.activityGroup;
  if(activityGroup.users.indexOf(req.user._id) >= 0) {
    return res.json({
      ret: -1,
      code: ErrorCode.ACTIVITY_GROUP_ALREADY_JOINED.code,
      msg: ErrorCode.ACTIVITY_GROUP_ALREADY_JOINED.desc
    });
  } else {
    //如果活动分组状态为已结束则返回结束状态
    if(!activityGroup.status === ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.code) {
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
        if(activityGroup.status === ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_ING.code) {

          //判断该分组报名人数是否已达上限 或者 numLimit ＝ 0 则为不限制人数
          if(activityGroup.users.length < activityGroup.numLimit || activityGroup.numLimit == 0) {
            activityGroup.users.push(req.user._id);
            activityGroup.save(function(err) {
              if (err) {
                return res.json({
                  ret: -1,
                  code: ErrorCode.DATABASE_ERROR.code,
                  msg: errorHandler.getErrorMessage(err)
                });
              } else {
                //加入活动发出通知逻辑(发送给自己)
                NotificationComponent.sendJoinActivityNotificationToSelf(req, res, activityGroup, req.user);
                //加入活动发出通知逻辑(发送给活动领队)
                NotificationComponent.sendJoinActivityNotificationToCaptain(req, res, activityGroup, req.user);

                return res.json({
                  ret: 1,
                  code: ErrorCode.SUCCESS.code,
                  msg: ErrorCode.SUCCESS.desc,
                });
              }
            });

            //更新与自己相关的活动
            req.user.activities.push(activityGroup.activity);
            User.update({
              _id: req.user._id
            }, {
              $set: {
                activities: req.user.activities
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
};


exports.quitForSite = function(req, res) {
  var activityGroup = req.activityGroup;
  if(activityGroup.users.indexOf(req.user._id) >= 0) {
    activityGroup.users = activityGroup.users.splice(activityGroup.users, activityGroup.users.indexOf(req.user._id));
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
    if(req.user.activities.indexOf(activityGroup.activity) >= 0) {
      req.user.activities = req.user.activities.splice(req.user.activities, req.user.activities.indexOf(activityGroup.activity));
      User.update({
        _id: req.user._id
      }, {
        $set: {
          activities: req.user.activities
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
  };
};


exports.membersForSite = function(req, res) {

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
