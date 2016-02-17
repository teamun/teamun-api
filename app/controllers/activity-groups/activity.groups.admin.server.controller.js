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
  GroupMembers = mongoose.model('GroupMembers');


exports.createForAdmin = function(req, res) {
  var activityGroup = new ActivityGroup(req.body);
  activityGroup.save(function(err) {;
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
          activity.activityGroups.push(activityGroup._id);
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


exports.findOneForAdmin = function(req, res) {
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


exports.findOneForEditForAdmin = function(req, res) {
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: {
      activityGroup: req.activityGroup
    }
  });
};


exports.updateForAdmin = function(req, res) {
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


exports.deleteForAdmin = function(req, res) {
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


exports.membersForAdmin = function(req, res) {

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