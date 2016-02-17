'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  Watch = mongoose.model('Watch');

/**
 * 关注
 */
exports.follow = function(req, res) {
  var followID = req.body.followID;
  var userID = req.user._id;

  Watch.find({
    follower: userID,
    following: followID
  }).exec(function(err, watch) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (watch[0]) {
        return res.json({
          ret: -1,
          code: ErrorCode.ALREADY_FOLLOWED.code,
          msg: ErrorCode.ALREADY_FOLLOWED.desc
        });
      } else {
        Watch.find({
          follower: followID,
          following: userID
        }).exec(function(err, watch) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          } else {
            var newWatch = new Watch();
            newWatch.follower = userID;
            newWatch.following = followID;
            if (watch[0]) {
              //如果已被该用户关注，设置互相关注关系。
              newWatch.status = true;
              newWatch.save(function(err) {
                if (err) {
                  return res.json({
                    ret: -1,
                    code: ErrorCode.DATABASE_ERROR.code,
                    msg: errorHandler.getErrorMessage(err)
                  });
                } else {
                  //更新关注者的互相关注状态。
                  Watch.update({
                    follower: followID,
                    following: userID
                  }, {
                    $set: {
                      status: true
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
                        newWatch: newWatch
                      });
                    }
                  });
                }
              });
            } else {
              newWatch.status = false;
              newWatch.save(function(err) {
                if (err) {
                  return res.json({
                    ret: -1,
                    code: ErrorCode.DATABASE_ERROR.code,
                    msg: errorHandler.getErrorMessage(err)
                  });
                } else {
                  return res.json({
                    ret: 1,
                    newWatch: newWatch
                  });
                }
              });
            }
          }
        });
      }
    }
  });

};


/**
 * 取消关注
 */
exports.unfollow = function(req, res) {
  var followID = req.body.followID;
  var userID = req.user._id;

  Watch.find({
    follower: userID,
    following: followID
  }).exec(function(err, watch) {
    if (!watch[0]) {
      return res.json({
        ret: -1,
        code: ErrorCode.NO_FOLLOW_THIS_USER.code,
        msg: ErrorCode.NO_FOLLOW_THIS_USER.desc
      });
    } else {
      Watch.remove({
        follower: userID,
        following: followID
      }, function(err) {
        if (err) {
          return res.json({
            ret: -1,
            code: ErrorCode.DATABASE_ERROR.code,
            msg: errorHandler.getErrorMessage(err)
          });
        } else {
          //删除关系后更新关注者的互相关注状态。
          Watch.update({
            follower: followID,
            following: userID
          }, {
            $set: {
              status: false
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
                msg: ErrorCode.SUCCESS.desc
              });
            }
          });
        }
      });
    }
  });
};


/**
 * 我的粉丝列表
 */
exports.follower = function(req, res) {
  var userID = req.user._id;
  Watch.find({
      following: userID
    })
    .populate({
      path: 'follower',
      select: 'nickname mobile'
    })
    .exec(function(err, follower) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          ret: 1,
          data: {follower: follower}
        });
      }
    });
};


/**
 * 我的关注列表
 */
exports.following = function(req, res) {
  var userID = req.user._id;
  Watch.find({
      follower: userID
    })
    .populate({
      path: 'following',
      select: 'nickname mobile'
    })
    .exec(function(err, following) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          ret: 1,
          data: {following: following}
        });
      }
    });
};
