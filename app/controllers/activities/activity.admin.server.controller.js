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
  ActivityType = require('../../utils/enum/activityType.js'),
  ActivityStatus = require('../../utils/enum/activityStatus.js'),
  ActivityGroupStatus = require('../../utils/enum/activityGroupStatus.js'),
  Activity = mongoose.model('Activity'),
  ActivityGroup = mongoose.model('ActivityGroup'),
  Organizer = mongoose.model('Organizer'),
  Event = mongoose.model('Event');


exports.createForAdmin = function(req, res) {
  //如果没有指定captain领队,则把创建人默认为领队
  if (!req.body.captain) {
    req.body.captain = req.user._id;
  }
  var activity = new Activity(req.body);
  activity.save(function(err) {;
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (!req.body.organizer) {
        var activityGroup = new ActivityGroup();
        activityGroup.name = '个人报名';
        activityGroup.activity = activity._id;
        activityGroup.signTime = new Date();
        activityGroup.deadlineTime = activity.startTime;
        activityGroup.users = req.user._id;
        activityGroup.save(function(err) {;
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          } else {
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
                Activity.update({
                  _id: activity._id
                }, {
                  $set: {
                    organizer: organizer._id
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
                      ret: 1,
                      msg: ErrorCode.SUCCESS.desc,
                      data: {
                        activity: activity,
                        activityGroup: activityGroup
                      }
                    }); 
                  }
                });
              }
            });
          }
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
    }
  });
};


exports.listForAdmin = function(req, res) {
  Activity.count({}, function(err, count){
    var range = utilsValidation.assertValidRange(req.headers.range);
    var limit = (range.rangeTo - range.rangeFrom) + 1;
    var queryParameters = paginate(req, res, count, limit);

    if(count > 0) {
      Activity.find()
        .populate('user', 'nickname')
        .populate('event', 'name')
        .populate('captain', 'nickname')
        .populate('organizer', 'type')
        .sort({
          'meta.createAt': -1
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
            return res.json({
              ret: 1,
              msg: ErrorCode.SUCCESS.desc,
              data: {
                activities: activities,
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


exports.findOneForAdmin = function(req, res) {
  Activity.findOne({
      _id: req.params.activityID
    })
    .populate('user', 'nickname')
    .populate('event', 'name')
    .populate('captain', 'nickname')
    .populate('organizer', 'type')
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
            activity: activity,
            activityStatusMap: ActivityStatus.statusCodeMap,
            activityGroupStatusMap: ActivityGroupStatus.statusCodeMap,
            typeMap: ActivityType.typeCodeMap
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
      activity: req.activity
    }
  });
};


exports.updateForAdmin = function(req, res) {
  var activity = req.activity;
  activity = _.extend(activity, req.body);
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
          activity: activity
        }
      });
    }
  });
};


exports.publishForAdmin = function(req, res) {
  var activity = req.activity;
  activity.status = ActivityStatus.statusCode.ACTIVITY_PUBLISHED.code;
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
          activity: activity
        }
      });
    }
  });
};


exports.recommendListForAdmin = function(req, res) {
  Activity.count({isRecommend: true}, function(err, count){
    var range = utilsValidation.assertValidRange(req.headers.range);
    var limit = (range.rangeTo - range.rangeFrom) + 1;
    var queryParameters = paginate(req, res, count, limit);

    if(count > 0) {
      Activity.find({isRecommend: true})
        .sort({
          'meta.createAt': -1
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
            return res.json({
              ret: 1,
              msg: ErrorCode.SUCCESS.desc,
              data: {
                activities: activities,
                statusMap: ActivityStatus.statusCodeMap
              }
            });
          }
        });
    };
  });
};


exports.recommendRemoveForAdmin = function(req, res) {
  var activity = req.activity;
  req.body.isRecommend = false;
  activity = _.extend(activity, req.body);
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
          activity: activity
        }
      });
    }
  });
};


exports.removeForAdmin = function(req, res) {
  var activity = req.activity;
  req.body.status = ActivityStatus.statusCode.ACTIVITY_DELETED.code;;
  activity = _.extend(activity, req.body);
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
          activity: activity
        }
      });
    }
  });
};


exports.recommendAddForAdmin = function(req, res) {
  var activity = req.activity;
  req.body.isRecommend = true;
  activity = _.extend(activity, req.body);
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
          activity: activity
        }
      });
    }
  });
};




