'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  RecruitGroupStatus = require('../../utils/enum/recruitGroupStatus.js'),
  RecruitGroup = mongoose.model('RecruitGroup'),
  OfficialAction = mongoose.model('OfficialAction'),
  User = mongoose.model('User'),
  NotificationComponent = require('../../components/notifications/notifications.server.component.js');



exports.findOneForSite = function(req, res) {
  RecruitGroup.find({action: req.params.actionID})
    .sort({'meta.createAt': -1})
    .exec(function(err, recruitGroups) {
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
            recruitGroups: recruitGroups,
            statusMap: RecruitGroupStatus.statusCodeMap
          }
        });
      }
    });
};


var joinBody = function(req, res, user) {
  var recruitGroup = req.recruitGroup;
  if(recruitGroup.users.indexOf(user._id) >= 0) {
    return res.json({
      ret: -1,
      code: ErrorCode.RECRUIT_GROUP_ALREADY_JOINED.code,
      msg: ErrorCode.RECRUIT_GROUP_ALREADY_JOINED.desc
    });
  } else {
    //如果动态招募分组状态为已结束则返回结束状态
    if(!recruitGroup.status == RecruitGroupStatus.statusCode.RECRUIT_GROUP_SIGN_UP_CLOSE.code) {
      return res.json({
        ret: -1,
        code: ErrorCode.RECRUIT_GROUP_SIGN_UP_CLOSE.code,
        msg: ErrorCode.RECRUIT_GROUP_SIGN_UP_CLOSE.desc
      });
    } else {
      //如果当前时间大于报名截至时间则更新动态状态为: 3 - 已结束
      if(new Date() > recruitGroup.deadlineTime) {
        RecruitGroup.update({
          _id: recruitGroup._id
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
          } else {
            return res.json({
              ret: -1,
              code: ErrorCode.RECRUIT_GROUP_SIGN_UP_CLOSE.code,
              msg: ErrorCode.RECRUIT_GROUP_SIGN_UP_CLOSE.desc
            });
          }
        });
      } else {
        //如果当前分组状态为报名中才可以报名
        if(recruitGroup.status == RecruitGroupStatus.statusCode.RECRUIT_GROUP_SIGN_UP_ING.code) {

          //判断该分组报名人数是否已达上限 或者 numLimit ＝ 0 则为不限制人数
          if(recruitGroup.users.length < recruitGroup.numLimit || recruitGroup.numLimit == 0) {
            recruitGroup.users.push(user._id);
            recruitGroup.save(function(err) {
              if (err) {
                return res.json({
                  ret: -1,
                  code: ErrorCode.DATABASE_ERROR.code,
                  msg: errorHandler.getErrorMessage(err)
                });
              } else {

                //加入招募动态发出通知逻辑(发送给自己)
                NotificationComponent.sendJoinOfficialActionNotificationToSelf(req, res, recruitGroup, user);

                return res.json({
                  ret: 1,
                  code: ErrorCode.SUCCESS.code,
                  msg: ErrorCode.SUCCESS.desc,
                });
              }
            });

            //更新与自己相关的活动
            user.officialActions.push(recruitGroup.officialAction);
            User.update({
              _id: user._id
            }, {
              $set: {
                officialActions: user.officialActions
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
            RecruitGroup.update({
              _id: recruitGroup._id
            }, {
              $set: {
                status: RecruitGroupStatus.statusCode.RECRUIT_GROUP_SIGN_UP_FULL.code
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
                  code: ErrorCode.RECRUIT_GROUP_SIGN_UP_FULL.code,
                  msg: ErrorCode.RECRUIT_GROUP_SIGN_UP_FULL.desc
                });
              }
            });
          }
        } else {
          return res.json({
            ret: -1,
            code: ErrorCode.RECRUIT_GROUP_JOIN_NOT_STARTED.code,
            msg: ErrorCode.RECRUIT_GROUP_JOIN_NOT_STARTED.desc
          });
        }
      }
    }
  }
};

exports.joinForSite = function(req, res) {
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
      };
      if (!user) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACCESS_TOKEN_EXPIRED.code,
          msg: ErrorCode.ACCESS_TOKEN_EXPIRED.desc
        });
      } else {
        joinBody(req, res, user);
      }
    });
  } else {
    var user = req.user;
    joinBody(req, res, user);
  }
};


var quitBody = function(req, res, user) {
  var recruitGroup = req.recruitGroup;
  if(recruitGroup.users.indexOf(user._id) >= 0) {
    recruitGroup.users = recruitGroup.users.splice(recruitGroup.users, recruitGroup.users.indexOf(user._id));
    recruitGroup.save(function(err) {
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
    if(user.officialActions.indexOf(recruitGroup.officialAction) >= 0) {
      user.officialActions = user.officialActions.splice(user.officialActions, user.officialActions.indexOf(recruitGroup.officialAction));
      User.update({
        _id: user._id
      }, {
        $set: {
          officialActions: user.officialActions
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
      code: ErrorCode.RECRUIT_GROUP_ALREADY_QUIT.code,
      msg: ErrorCode.RECRUIT_GROUP_ALREADY_QUIT.desc
    });
  }
};

exports.quitForSite = function(req, res) {
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
      };
      if (!user) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACCESS_TOKEN_EXPIRED.code,
          msg: ErrorCode.ACCESS_TOKEN_EXPIRED.desc
        });
      } else {
        quitBody(req, res, user);
      }
    });
  } else {
    var user = req.user;
    quitBody(req, res, user);
  }
};


exports.membersForSite = function(req, res) {
  RecruitGroup.find({officialAction: req.params.actionID}, 'name users')
  .populate('users', 'nickname avatar mobile realname idcard isSafe')
  .exec(function(err, groups){
		var member_array = [];
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
		      
		      members.groupId = groups[i]._id;
		      members.groupName = groups[i].name;
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
};