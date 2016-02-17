'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  request = require('request'),
  url = require('url'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  dom = require('xmldom').DOMParser,
  select = require('xpath.js'),
  async = require('async'),
  getAccessToken = require('../../utils/wechat/accesstoken.js'),
  AccessToken = mongoose.model('AccessToken'),
  JSAPITicket = mongoose.model('JSAPITicket'),
  WechatActivity = mongoose.model('WechatActivity'),
  WechatActivityJoinRecord = mongoose.model('WechatActivityJoinRecord'),
  util = require('util'),
  qnencode = require('../../utils/wechat/qnencode.js'),
  config = require('../../../config/config');


exports.add = function(req, res) {
  var code = req.query.code;
  var openIdUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + wechat_conf.app_id + '&secret=' + wechat_conf.app_secret + '&code=' + code + '&grant_type=authorization_code';
  request.get(openIdUrl, {
    dataType: 'json'
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      res.redirect('http://wechat-activity.teamun.com/activity-add/' + body.openid);
    } else {
      res.json({
        success: false,
        message: 'get openid error'
      });
    }
  });
};


exports.create = function(req, res) {
  async.waterfall([
    function(cb) {
      getAccessToken(wechat_conf.app_id, wechat_conf.app_secret, function(result) {
        cb(null, result);
      });
    },function(data, cb){
      var userInfoUrl = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + data.token + '&openid=' + req.body.openid + '&lang=zh_CN';
      request.get(userInfoUrl, {
        dataType: 'json'
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var body = JSON.parse(body);
          if(!body.errcode) {
            cb(null, data);
          } else {
            var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + wechat_conf.app_id + '&secret=' + wechat_conf.app_secret;
            request.get(tokenUrl, {
              dataType: 'json'
            }, function(error, response, body) {
              if (!error && response.statusCode == 200) {
                var body = JSON.parse(body);
                AccessToken.update({
                  appId: wechat_conf.app_id,
                  appSecret: wechat_conf.app_secret
                }, {
                  $set: {
                    appId: wechat_conf.app_id,
                    appSecret: wechat_conf.app_secret,
                    token: body.access_token,
                    expire: (new Date().getTime()) + (body.expires_in - 10) * 1000,
                    'meta.updateAt': Date.now()
                  }
                }, function(err) {
                  if (err) {
                    res.json({
                      success: false,
                      message: 'update token error'
                    });
                  } else {
                    body.token = body.access_token;
                    body.expire = body.expires_in;
                    delete body.access_token;
                    delete body.expires_in;
                    cb(null, body);
                  }
                });
              } else {
                console.error("update access token failed");
              }
            });
          }
        }
      });
    }
  ], function(err, results) {
    var activity = req.body;
    if(activity.startTime != undefined && activity.endTime != undefined && new Date(activity.startTime) > new Date(activity.endTime)){
     return res.status(400).send({
        message: "结束日期不能小于开始日期"
      });
    }
    var userInfoUrl = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + results.token + '&openid=' + req.body.openid + '&lang=zh_CN';
    request.get(userInfoUrl, {
      dataType: 'json'
    }, function(error, response, body) {

      if (!error && response.statusCode == 200) {

        var body = JSON.parse(body);
        activity.nickname = body.nickname;
        activity.headimgurl = body.headimgurl;

        for (var i = 0; i < activity.posters.length; i++) {
          var srcImg = 'http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=' + results.token + '&media_id=' + activity.posters[i];
          var qnImg = 'teamun:wechat/activity/' + activity.posters[i] + '.jpg';
          activity.posters[activity.posters.indexOf(activity.posters[i])] = config.qiniu.domain + '/wechat/activity/' + activity.posters[i] + '.jpg';
          var path = util.format('/fetch/%s/to/%s', qnencode.safeEncode(srcImg), qnencode.safeEncode(qnImg));
          var _url = url.format({
            protocol: 'http',
            hostname: 'iovip.qbox.me',
            pathname: path
          });
          var token = qnencode.accessToken(path, null, config.qiniu.secretKey, config.qiniu.accessKey);
          request({
              url: _url, 
              method: 'POST',
              headers: {
                'Authorization': token,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }, function(error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log('fetch success');
              } else {
                res.json({
                  success: false,
                  message: 'fetch failed'
                });
              }
            });
        };

        var wechatActivity = new WechatActivity(activity);
        wechatActivity.save(function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            var wechatUser = body;
            wechatUser.openid = body.openid;
            wechatUser.nickname = body.nickname;
            wechatUser.headimgurl = body.headimgurl;
            wechatUser.sex = body.sex;
            wechatUser.language = body.language;
            wechatUser.city = body.city;
            wechatUser.province = body.province;
            wechatUser.country = body.country;
            wechatUser.subscribe_time = body.subscribe_time;
            wechatUser.activity = wechatActivity._id;

            var joinRecord = new WechatActivityJoinRecord(wechatUser);
            joinRecord.save(function(err) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                var newactivity = wechatActivity;
                newactivity.joinRecord = joinRecord._id;
                newactivity = _.extend(newactivity, wechatActivity);
                newactivity.save(function(err) {
                  if (err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    res.json({
                      success: true,
                      activity: wechatActivity
                    });
                  }
                });
              }
            });
          }
        });
      } else {
        res.json({
          success: false,
          message: 'get openid error'
        });
      }
    });
  });
};


exports.findActivityDetail = function(req, res) {
  var code = req.query.code;
  if (code) {
    var openIdUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + wechat_conf.app_id + '&secret=' + wechat_conf.app_secret + '&code=' + code + '&grant_type=authorization_code';
    request.get(openIdUrl, {
      dataType: 'json'
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var body = JSON.parse(body);
        var openid = body.openid;
        var userInfoUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + body.access_token + '&openid=' + openid + '&lang=zh_CN';
        request.get(userInfoUrl, {
          dataType: 'json'
        }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);
            WechatActivity.findOne({_id: req.params.wechatActivityID})
            .populate('joinRecord')
            .exec(function(err, activity) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                res.json({
                  success: true,
                  activity: activity,
                  userinfo: body
                });
              }
            });
          } else {
            res.json({
              success: false,
              message: 'get openid error'
            });
          }
        });
      } else {
        res.json({
          success: false,
          message: 'get openid error'
        });
      }
    });
  } else {
    WechatActivity.findOne({_id: req.params.wechatActivityID})
    .populate('joinRecord')
    .exec(function(err, activity) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        var userinfo = activity;
        res.json({
          success: true,
          activity: activity,
          userinfo: userinfo
        });
      }
    });
  }

};


exports.findOne = function(req, res) {
  res.json({
    success: true,
    activity: req.activity
  });
};


exports.join = function(req, res) {
  var wechatUser = req.body;
  wechatUser.activity = req.query.activity_id;

  var joinRecord = new WechatActivityJoinRecord(wechatUser);
  joinRecord.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      WechatActivity.find({_id: joinRecord.activity}).exec(function(err, activity) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {

          if (activity[0].joinRecord) {
            var join_record_array = [];
            for (var i = 0; i < activity[0].joinRecord.length; i++) {
              join_record_array.push(activity[0].joinRecord[i]);
            };
            join_record_array.push(joinRecord._id);
            activity[0].joinRecord = join_record_array;
          }

          WechatActivity.findByIdAndUpdate(joinRecord.activity,{$set:{joinRecord: activity[0].joinRecord}},function(err,activity){
            res.json({
              success: true,
              activity: joinRecord
            });
          });

        }
      });
      
    }
  });
};


exports.quit = function(req, res) {
  WechatActivityJoinRecord.remove({openid: req.query.openid, activity: req.query.activity_id}, function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      WechatActivity.find({_id: req.query.activity_id}).exec(function(err, activity) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {

          if (activity[0].joinRecord) {
            var join_record_array = [];
            for (var i = 0; i < activity[0].joinRecord.length; i++) {
              if(req.query.join_id == activity[0].joinRecord[i]) {
                activity[0].joinRecord.splice(i, 1);
              } else {
                join_record_array.push(activity[0].joinRecord[i]);
              }
            };
            activity[0].joinRecord = join_record_array;
          }
          WechatActivity.findByIdAndUpdate(req.query.activity_id,{$set:{joinRecord: activity[0].joinRecord}},function(err,activity){
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              res.json({
                success: true
              });
            }
          });
        }
      });

    }
  });
  
};


exports.remove = function(req, res) {
  if(req.query.myactivities instanceof Array) {
    var joinRecords = req.query.myactivities;
    for (var i = 0; i < joinRecords.length; i++) {
      WechatActivityJoinRecord.find({_id: joinRecords[i]}).exec(function(err, joinActivities) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          WechatActivityJoinRecord.remove({openid: req.query.openid, activity: joinActivities[0].activity}, function(err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              // res.json({
              //   success: true
              // });
            }
          });
        }
      });
    }
    res.json({
      success: true
    });
  } else {
    WechatActivityJoinRecord.find({_id: req.query.myactivities}).exec(function(err, joinActivities) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        WechatActivityJoinRecord.remove({openid: req.query.openid, activity: joinActivities[0].activity}, function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.json({
              success: true
            });
          }
        });
      }
    });
  }

};


exports.getJoinList = function(req, res) {
  WechatActivityJoinRecord.find({
    activity: req.activity._id
  }, function(err, joinRecords) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        success: true,
        joinRecords: joinRecords
      });
    }
  });
};


exports.getList = function(req, res) {
  var code = req.query.code;
  var openIdUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + wechat_conf.app_id + '&secret=' + wechat_conf.app_secret + '&code=' + code + '&grant_type=authorization_code';
  request.get(openIdUrl, {
    dataType: 'json'
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      res.redirect('http://wechat-activity.teamun.com/activity-list/' + body.openid);
    } else {
      res.json({
        success: false,
        message: 'get openid error'
      });
    }
  });
};


exports.list = function(req, res) {
  WechatActivityJoinRecord.find({openid: req.params.openid})
    .populate('activity')
    .sort({'meta.createAt': -1})
    .exec(function(err, activities) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        success: true,
        activities: activities
      });
    }
  });
};


/**
 * load conf
 */
var wechat_conf = fs.readFileSync('./config/wechat/default.json');
if (wechat_conf) {
  wechat_conf = JSON.parse(wechat_conf);
}


/**
 * Team middleware
 */
exports.wechatActivityByID = function(req, res, next, id) {
  WechatActivity.findById(id).exec(function(err, activity) {
    if (err) return next(err);
    if (!activity) return next(new Error('Failed to load wechat activity ' + id));
    req.activity = activity;
    next();
  });
};
