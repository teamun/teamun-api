'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  request = require('request'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  WechatActivity = mongoose.model('WechatActivity'),
  config = require('../../../config/config');


exports.getClimbUserInfo = function(req, res) {
  var code = req.query.code;
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
          res.json({
            success: true,
            userinfo: body
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
};

/**
 * load conf
 */
var wechat_conf = fs.readFileSync('./config/wechat/default.json');
if (wechat_conf) {
  wechat_conf = JSON.parse(wechat_conf);
}
