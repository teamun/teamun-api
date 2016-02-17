'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  async = require('async'),
  utilsValidation = require('../../utils/paginate/utilsValidation.js'),
  paginate = require('node-paginate-anything'),
  moment = require('moment'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  ActivityType = require('../../utils/enum/activityType.js'),
  ActivityStatus = require('../../utils/enum/activityStatus.js'),
  ActivityGroupStatus = require('../../utils/enum/activityGroupStatus.js'),
  Activity = mongoose.model('Activity'),
  ActivityGroup = mongoose.model('ActivityGroup'),
  Organizer = mongoose.model('Organizer'),
  Event = mongoose.model('Event'),
  User = mongoose.model('User'),
  NotificationComponent = require('../../components/notifications/notifications.server.component.js');


exports.createForMobile = function(req, res) {
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
        //解析移动端post body activity 对象
        var body = JSON.parse(req.body.activity);
        //解析移动端提交活动项目_id
        if(body.event) {
          body.event = body.event._id;
        } else {
          return res.json({
            ret: -1,
            code: ErrorCode.EVENT_REQUIRED_ERROR.code,
            msg: ErrorCode.EVENT_REQUIRED_ERROR.desc
          });
        }
        var activity = new Activity(body);
        //移动端默认领队为创建人
        activity.captain = user._id;
        activity.mobile = user.mobile;
        //移动端创建活动默认发布状态 1
        activity.status = ActivityStatus.statusCode.ACTIVITY_PUBLISHED.code;

        activity.save(function(err) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          } else {
            var activityGroup = new ActivityGroup();
            activityGroup.name = '个人报名';
            activityGroup.feeDesc = '免费';
            activityGroup.activity = activity._id;
            activityGroup.signTime = new Date();
            activityGroup.deadlineTime = activity.startTime;
            activityGroup.users = user._id;
            activityGroup.save(function(err) {
              if (err) {
                return res.json({
                  ret: -1,
                  code: ErrorCode.DATABASE_ERROR.code,
                  msg: errorHandler.getErrorMessage(err)
                });
              } else {

                //活动创建发出通知逻辑
                NotificationComponent.sendCreateActivityNotificationToSelf(req, res, activityGroup, user);

                //更新活动归属个人分组
                Organizer.findOne({
                  type: 'presonal'
                }).exec(function(err, organizer) {
                  if (err) {
                    return res.json({
                      ret: -1,
                      code: ErrorCode.DATABASE_ERROR.code,
                      msg: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    //更新活动的创建单位以及关联分组
                    Activity.update({
                      _id: activity._id
                    }, {
                      $set: {
                        organizer: organizer._id,
                        activityGroups: activityGroup._id
                      }
                    }, function(err) {
                      if (err) {
                        return res.json({
                          ret: -1,
                          code: ErrorCode.DATABASE_ERROR.code,
                          msg: errorHandler.getErrorMessage(err)
                        });
                      } else {
                        Activity.findOne(activity._id)
                        .populate('user', 'nickname avatar')
                        .populate('event', 'name logo')
                        .populate('captain', 'nickname avatar')
                        .populate('organizer', 'type name logo')
                        .populate('activityGroups', '')
                        .exec(function(err, activity) {
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
                                activity: activity
                              }
                            }); 
                          }
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
                  };
                });
              };
            });
          };
        });
      };
    });
  } else {
    return res.json({
      ret: -1,
      code: ErrorCode.ACCESS_TOKEN_NO_PROVIDED.code,
      msg: ErrorCode.ACCESS_TOKEN_NO_PROVIDED.desc
    });
  };
};


var queryBody = function(req, res, query, hasmore, flag) {
  Activity.count(query, function(err, count){
    if(count > 0) {
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
      };
      //如果limit 小于10，或rangeTo = count 说明后面没有更多数据
      if(queryParameters.limit < 10 || (range.rangeTo + 1 == count)) {
        hasmore = false;
      };

      Activity.find(query, 'captain event activityGroups name startTime city location status type membersCount')
        .populate('user', 'nickname')
        .populate('event', 'name')
        .populate('captain', 'nickname avatar')
        .populate('organizer', 'type')
        .populate('activityGroups', 'users')
        .sort({
          'startTime': 1
        })
        .limit(queryParameters.limit)
        .skip(queryParameters.skip)
        .exec(function(err, activities) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          } else {
            //计算每个活动总的报名人数 membersCount
            for (var i = 0; i < activities.length; i++) {
              if (activities[i].activityGroups) {
                for (var j = 0; j < activities[i].activityGroups.length; j++) {
                  if(activities[i].activityGroups[j].users) {
                    activities[i].membersCount += activities[i].activityGroups[j].users.length;
                  };
                };
              };
            };
            return res.json({
              ret: 1,
              msg: ErrorCode.SUCCESS.desc,
              data: {
                activities: activities,
                hasmore: hasmore,
                flag: flag,
                statusMap: ActivityStatus.statusCodeMap
              }
            });
          }
        });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {
          activities: null
        }
      });
    }
  });
};


exports.listForMobile = function(req, res) {
  //如果没有传递页码参数返回信息
  if(!req.query.page || req.query.page < 0){
    return res.json({
      ret: -1,
      code: ErrorCode.PAGINATE_ERROR.code,
      msg: ErrorCode.PAGINATE_ERROR.desc
    });
  };
  req.headers.range = utilsValidation.getRange(req.query.page);
  req.headers['range-unit'] = 'items';
  var hasmore = true;
  var flag = '1'; //1: startTime 大于当天时间的活动 2: startTime 小于当天时间的活动
  
  var date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  var query = {};
  if(req.query.flag) {
    if(req.query.flag === '1') {
      query['startTime'] = {$gt: date.getTime()};
      flag = '1';
    } else {
      query['startTime'] = {$lt: date.getTime()};
      flag = '2';
    };
  } else {
    query['startTime'] = {$gt: date.getTime()};
    flag = '1';
  }
  //查询推荐的和状态为 已发布: 1 报名中: 2 已开始: 3 三种状态的活动
  query['status'] = {$in: [ActivityStatus.statusCode.ACTIVITY_PUBLISHED.code, ActivityStatus.statusCode.ACTIVITY_SIGN_UP_ING.code, ActivityStatus.statusCode.ACTIVITY_BEGUN.code]};
  Activity.count(query, function(err, count){
    if(count > 0) {
      queryBody(req, res, query, hasmore, flag);
    } else if(count === 0 && flag === '1') {
      query['startTime'] = {$lt: date.getTime()};
      flag = '2';
      queryBody(req, res, query, hasmore, flag);
    }
  });
};


exports.findOneForMobile = function(req, res) {
  Activity.findOne({
    _id: req.params.activityID
  })
  .populate('user', 'nickname avatar')
  .populate('event', 'name logo')
  .populate('captain', 'nickname avatar tags')
  .populate('organizer', 'type name logo')
  .populate({path: 'activityGroups', options:{sort: {'meta.createAt': 1}}})
  .exec(function(err, activity) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      async.waterfall([
        function(cb){
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
                //判断当前用户是否加入该活动任意分组，如果已加入标识: isJoin = true
                for (var i = 0; i < activity.activityGroups.length; i++) {
                  if(activity.activityGroups[i].users.indexOf(user._id) >= 0) {
                    activity.activityGroups[i].isJoin = true;
                  } else {
                    activity.activityGroups[i].isJoin = false;
                  };
                };
                cb(null, activity);
              };
            });
          } else {
            cb(null, activity);
          }
        },function(activity, cb){
          //计算每个活动总的报名人数 membersCount
          for (var i = 0; i < activity.activityGroups.length; i++) {
            activity.membersCount += activity.activityGroups[i].users.length;
          };

          //判断任何分组中有任意一组报名时间小于当前时间，并且分组状态为0: 未开始, 活动状态为0: 待发布，如果条件符合则更新该分组状态为 1: 报名中
          var isSignTime = false;
          for (var i = 0; i < activity.activityGroups.length; i++) {
            if(new Date() > activity.activityGroups[i].signTime && activity.activityGroups[i].status === ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP.code) {
              //如果该分组报名时间小于当前时间 并且 活动状态为未开始:0 ,则更改分组状态为: 1 - 报名中
              ActivityGroup.update({
                _id: activity.activityGroups[i]._id
              }, {
                $set: {
                  status: ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_ING.code
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
              isSignTime = true;
            };

            //如果该分组报名截至时间小于当前时间并且当前状态不等于已结束 ,则更改分组状态为: 3 - 已结束
            if(new Date() > activity.activityGroups[i].deadlineTime && activity.activityGroups[i].status !== ActivityGroupStatus.statusCode.ACTIVITY_GROUP_SIGN_UP_CLOSE.code) {
              ActivityGroup.update({
                _id: activity.activityGroups[i]._id
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
                };
              });
            };
          };

          if(activity.status === ActivityStatus.statusCode.ACTIVITY_PUBLISHED.code && isSignTime === true) {
            Activity.update({
              _id: req.params.activityID
            }, {
              $set: {
                status: ActivityStatus.statusCode.ACTIVITY_SIGN_UP_ING.code
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

          //如果当前活动状态为: 报名中, 并且时间大于活动开始时间更新活动状态为：已开始
          if(activity.status === ActivityStatus.statusCode.ACTIVITY_SIGN_UP_ING.code && new Date() > activity.startTime) {
            Activity.update({
              _id: req.params.activityID
            }, {
              $set: {
                status: ActivityStatus.statusCode.ACTIVITY_BEGUN.code
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
          cb(null, activity);
        }
      ],function(err, activity){
        return res.json({
          ret: 1,
          msg: ErrorCode.SUCCESS.desc,
          data: {
            activity: activity,
            activityStatusMap: ActivityStatus.statusCodeMap,
            activityGroupStatusMap: ActivityGroupStatus.statusCodeMap,
            typeMap: ActivityType.typeCodeMap
          }
        });
      });
    };
  });
};


exports.updateForMobile = function(req, res) {
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
        //解析post body activity 对象
        var body = JSON.parse(req.body.activity);
        //解析提交活动项目_id
        if(body.event) {
          body.event = body.event._id;
        } else {
          return res.json({
            ret: -1,
            code: ErrorCode.EVENT_REQUIRED_ERROR.code,
            msg: ErrorCode.EVENT_REQUIRED_ERROR.desc
          });
        };

        //解析提交活动分组_id
        var group_array = [];
        if(body.activityGroups) {
          for (var i = 0; i < body.activityGroups.length; i++) {
            group_array.push(body.activityGroups[i]._id);
          };
          body.activityGroups = group_array;
        };

        //解析领队_id
        if(body.captain) {
          body.captain = body.captain._id;
        };

        //membersCount 永远是0
        body.membersCount = 0;

        if(body._id) {
          Activity.findOne({_id: body._id})
          .exec(function(err, activity) {
            if (err) {
              return res.json({
                ret: -1,
                code: ErrorCode.DATABASE_ERROR.code,
                msg: errorHandler.getErrorMessage(err)
              });
            } else {

              //活动时间变更发送通知提醒
              if(new Date(activity.startTime).getTime().toString() !== body.startTime.toString()) {
                var startTimeStr = moment.unix((body.startTime / 1000)).locale('zh-cn').format('llll');
                NotificationComponent.sendUpdateActivityTimeNotificationToEveryBody(req, res, activity, startTimeStr);
              };

              //活动地点变更发送通知提醒
              if(activity.location.toString() !== body.location.toString()) {
                NotificationComponent.sendUpdateActivityLocationNotificationToEveryBody(req, res, activity, body.location);
              };

              var activity = _.extend(activity, body);
              activity.save(function(err) {
                if (err) {
                  return res.json({
                    ret: -1,
                    code: ErrorCode.DATABASE_ERROR.code,
                    msg: errorHandler.getErrorMessage(err)
                  });
                } else {
                  Activity.findOne(activity._id)
                  .populate('user', 'nickname avatar')
                  .populate('event', 'name logo')
                  .populate('captain', 'nickname avatar')
                  .populate('organizer', 'type name logo')
                  .populate('activityGroups', '')
                  .exec(function(err, activity) {
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
                          activity: activity
                        }
                      }); 
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  } else {
    return res.json({
      ret: -1,
      code: ErrorCode.ACCESS_TOKEN_NO_PROVIDED.code,
      msg: ErrorCode.ACCESS_TOKEN_NO_PROVIDED.desc
    });
  }
};

