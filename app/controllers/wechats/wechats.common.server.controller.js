'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  crypto = require('crypto'),
  request = require('request'),
  errorHandler = require('../errors.server.controller.js'),
  sign = require('../../utils/wechat/sign.js'),
  getAccessToken = require('../../utils/wechat/accesstoken.js'),
  getJSAPITicket = require('../../utils/wechat/jsapiticket.js'),
  mongoose = require('mongoose'),
  url = require('url'),
  dom = require('xmldom').DOMParser,
  select = require('xpath.js'),
  async = require('async');


exports.getSignPackage = function(req, res, next) {
  var url = req.query.url;
  async.waterfall([
    function(cb) {
      getJSAPITicket(wechat_conf.app_id, wechat_conf.app_secret, function(result) {
        cb(null, result);
      });
    }
  ], function(err, results) {
    var nonceStr = createNonceStr();
    var timestamp = createTimestamp();
    var jsApiTicket = results.ticket;
    var signature = sign(nonceStr, jsApiTicket, timestamp, url);
    var result = {
      appId: wechat_conf.app_id,
      timestamp: timestamp,
      nonceStr: nonceStr,
      signature: signature
    };
    res.json({
      success: true,
      signpackage: result
    });
  });
};


/*!
 * 生成随机字符串
 */
var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

/*!
 * 生成时间戳
 */
var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000, 0) + '';
};


/**
 * check signature
 */
var checkSignature = function(query, token) {
  var signature = query.signature;
  var timestamp = query.timestamp;
  var nonce = query.nonce;

  var shasum = crypto.createHash('sha1');
  var arr = [token, timestamp, nonce].sort();
  shasum.update(arr.join(''));

  return shasum.digest('hex') === signature;
};


/**
 * load conf
 */
var wechat_conf = fs.readFileSync('./config/wechat/default.json');
if (wechat_conf) {
  wechat_conf = JSON.parse(wechat_conf);
}