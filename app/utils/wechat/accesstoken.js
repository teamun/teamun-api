'use strict';
var mongoose = require('mongoose'),
  request = require('request'),
  AccessToken = mongoose.model('AccessToken');

/**
 * 获取AccessToken封装方法
 */
var getAccessToken = function(appId, secret, cb) {
  getLocalAccessToken(appId, secret, function(localAccessToken) {
    if (localAccessToken) {
      if (!!localAccessToken.token && (new Date().getTime()) < localAccessToken.expire) {
        cb(localAccessToken);
      } else {
        updateAccessToken(appId, secret, function(updateAccessToken) {
          if (updateAccessToken) {
            updateAccessToken.token = updateAccessToken.access_token;
            updateAccessToken.expire = updateAccessToken.expires_in;
            delete updateAccessToken.access_token;
            delete updateAccessToken.expires_in;
            cb(updateAccessToken);
          } else {
            console.error("update access token failed");
          }
        });
      }
    } else {
      getNewAccessToken(appId, secret, function(newAccessToken) {
        if (newAccessToken) {
          newAccessToken.token = newAccessToken.access_token;
          newAccessToken.expire = newAccessToken.expires_in;
          delete newAccessToken.access_token;
          delete newAccessToken.expires_in;
          cb(newAccessToken);
        } else {
          console.error("get access token failed");
        }
      });
    }
  });
};


/**
 * 获取本地AccessToken
 */
function getLocalAccessToken(appId, secret, cb) {
  var result = null;
  AccessToken.findOne({
    appId: appId,
    appSecret: secret
  }, function(err, accessToken) {
    if (err) {
      cb(err);
    } else {
      result = accessToken;
    }
    cb(result);
  });
};


/**
 * 更新本地AccessToken
 */
function updateAccessToken(appId, secret, cb) {
  var result = null;
  var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + appId + '&secret=' + secret;
  request.get(tokenUrl, {
    dataType: 'json'
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      AccessToken.update({
        appId: appId,
        appSecret: secret
      }, {
        $set: {
          appId: appId,
          appSecret: secret,
          token: body.access_token,
          expire: (new Date().getTime()) + (body.expires_in - 10) * 1000,
          'meta.updateAt': Date.now()
        }
      }, function(err) {
        if (err) {
          cb(err);
        } else {
          result = body;
        }
        cb(result);
      });
    } else {
      console.error("update access token failed");
    }
  });
};


/**
 * 获取一个新的AccessToken
 */
function getNewAccessToken(appId, secret, cb) {
  var result = null;
  var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + appId + '&secret=' + secret;

  request.get(tokenUrl, {
    dataType: 'json'
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      var accessToken = new AccessToken({
        appId: appId,
        appSecret: secret,
        token: body.access_token,
        expire: (new Date().getTime()) + (body.expires_in - 10) * 1000
      });
      accessToken.save(function(err) {
        if (err) {
          cb(err);
        } else {
          result = body;
        }
        cb(result);
      });
    } else {
      console.error("get access token failed");
    }
  });
};


module.exports = getAccessToken;
