'use strict';
var mongoose = require('mongoose'),
  async = require('async'),
  request = require('request'),
  getAccessToken = require('../../utils/wechat/accesstoken.js'),
  JSAPITicket = mongoose.model('JSAPITicket'),
  AccessToken = mongoose.model('AccessToken');

/**
 * 获取JSAPITicket封装方法
 */
var getJSAPITicket = function(appId, secret, cb) {

  async.waterfall([
    function(cb) {
      getAccessToken(appId, secret, function(result) {
        cb(null, result);
      });
    }
  ], function(err, results) {
    var accessToken = results.token;
    getLocalJSAPITicket(appId, secret, function(localJSAPITicket) {
      if (localJSAPITicket) {
        if (!!localJSAPITicket.ticket && (new Date().getTime()) < localJSAPITicket.expire) {
          cb(localJSAPITicket);
        } else {
          updateJSAPITicket(appId, secret, accessToken, function(updateJSAPITicket) {
            if (updateJSAPITicket) {
              updateJSAPITicket.ticket = updateJSAPITicket.ticket;
              updateJSAPITicket.expire = updateJSAPITicket.expires_in;
              delete updateJSAPITicket.expires_in;
              cb(updateJSAPITicket);
            } else {
              console.error("update ticket failed");
            }
          });
        }
      } else {
        getNewJSAPITicket(appId, secret, accessToken, function(newJSAPITicket) {
          if (newJSAPITicket) {
            newJSAPITicket.ticket = newJSAPITicket.ticket;
            newJSAPITicket.expire = newJSAPITicket.expires_in;
            delete newJSAPITicket.expires_in;
            cb(newJSAPITicket);
          } else {
            console.error("get ticket failed");
          }
        });
      }
    });

  });

};


/**
 * 获取本地JSAPITicket
 */
function getLocalJSAPITicket(appId, secret, cb) {
  var result = null;
  JSAPITicket.findOne({
    appId: appId,
    appSecret: secret
  }, function(err, jsapiTicket) {
    if (err) {
      cb(err);
    } else {
      result = jsapiTicket;
    }
    cb(result);
  });
};

function updateJSAPITicket(appId, secret, accessToken, cb) {
  var result = null;
  var ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi';
  request.get(ticketUrl, {
    dataType: 'json'
  }, function(error, response, body) {
        var body = JSON.parse(body);
        console.log(body);
        if(!body.errcode) {
            if (!error && response.statusCode == 200) {
              JSAPITicket.update({
                appId: appId,
                appSecret: secret
              }, {
                $set: {
                  appId: appId,
                  appSecret: secret,
                  ticket: body.ticket,
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
              console.error("update ticket failed");
            }
        } else if(body.errcode == 40001) {
          console.log('errcode 40001');
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
                    res.json({
                      success: false,
                      message: 'update token error'
                    });
                  } else {
                    updateJSAPITicket(appId, secret, body.access_token, function(updateJSAPITicket) {
                      if (updateJSAPITicket) {
                        updateJSAPITicket.ticket = updateJSAPITicket.ticket;
                        updateJSAPITicket.expire = updateJSAPITicket.expires_in;
                        delete updateJSAPITicket.expires_in;
                        cb(updateJSAPITicket);
                      } else {
                        console.error("update ticket failed");
                      }
                    });
                  }
                });
              } else {
                console.error("update access token failed");
              }
            });
        }
  });
};

/**
 * 更新本地JSAPITicket
 
function updateJSAPITicket(appId, secret, accessToken, cb) {
  var result = null;
  var ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi';
  request.get(ticketUrl, {
    dataType: 'json'
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      JSAPITicket.update({
        appId: appId,
        appSecret: secret
      }, {
        $set: {
          appId: appId,
          appSecret: secret,
          ticket: body.ticket,
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
      console.error("update ticket failed");
    }
  });
};
*/

/**
 * 获取一个新的JSAPITicket
 */
function getNewJSAPITicket(appId, secret, accessToken, cb) {
  var result = null;
  var ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi';

  request.get(ticketUrl, {
    dataType: 'json'
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      var jsapiTicket = new JSAPITicket({
        appId: appId,
        appSecret: secret,
        ticket: body.ticket,
        expire: (new Date().getTime()) + (body.expires_in - 10) * 1000
      });
      jsapiTicket.save(function(err) {
        if (err) {
          cb(err);
        } else {
          result = body;
        }
        cb(result);
      });
    } else {
      console.error("get ticket failed");
    }
  });
};

module.exports = getJSAPITicket;
