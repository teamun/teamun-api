'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller'),
  config = require('../../../config/config'),
  mongoose = require('mongoose'),
  crypto = require('crypto'),
  passport = require('passport'),
  moment = require('moment'),
  jwt = require('jwt-simple'),
  top = require("top"),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  User = mongoose.model('User'),
  UserAuthCode = mongoose.model('UserAuthCode'),
  City = mongoose.model('City');

// var regx = /^(13|15|17|18|14)[0-9]{9}$/;

var regx = /^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/;

var client = top.createClient({
  appkey: config.alidayu.appkey,
  appsecret: config.alidayu.appsecret,
  REST_URL: config.alidayu.REST_URL
});

/**
 * 发送注册短信验证码
 */
exports.sendsmscode = function(req, res) {

  var mobile = req.body.mobile;
  if (!mobile || !regx.exec(mobile)) {
    return res.json({
      ret: -1,
      code: ErrorCode.MOBILE_FORMAT_ERROR.code,
      msg: ErrorCode.MOBILE_FORMAT_ERROR.desc
    });
  }

  var code = Math.floor(Math.random() * 900000) + 100000;
  var params_check = {
    extend: '',
    sms_type: 'normal',
    sms_free_sign_name: '队部',
    sms_param: '{"product":"Teamun队部", "code":"' + parseInt(code) + '"}',
    rec_num: mobile,
    sms_template_code: 'SMS_1890048'
  };

  UserAuthCode.findOne({
    mobile: mobile,
    isUse: false
  }).exec(function(err, userAuthCode) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (!userAuthCode) {
        client.invoke('alibaba.aliqin.fc.sms.num.send', params_check, [], null, 'GET', function(err, result) {
          if (!err) {
            var registerCode = UserAuthCode();
            registerCode.mobile = mobile;
            registerCode.code = code;
            //设置验证码有效时间
            registerCode.expire = moment().add('minutes', 10).valueOf();
            registerCode.save(function(err) {
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
                  data: ''
                });
              }
            });
          } else {
            res.json({
              ret: -1,
              message: err
            });
          }
        });
      } else {

        //限制每个手机号码每日只能发送5条短信
        var count = (userAuthCode.count + 1);
        var updateAt = moment(userAuthCode.meta.updateAt).format('YYYYMMDD');
        var now = moment(new Date()).format('YYYYMMDD');

        if (userAuthCode.count >= 5 && (updateAt == now)) {
          return res.json({
            ret: -1,
            code: ErrorCode.AUTH_CODE_TODAY_UPPER_LIMIT.code,
            msg: ErrorCode.AUTH_CODE_TODAY_UPPER_LIMIT.desc
          });
        } else if (userAuthCode.count >= 5 && (updateAt != now)) {
          count = 0;
        }

        userAuthCode.remove(function(err) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          } else {
            client.invoke('alibaba.aliqin.fc.sms.num.send', params_check, [], null, 'GET', function(err, result) {
              if (!err) {
                var registerCode = UserAuthCode();
                registerCode.mobile = mobile;
                registerCode.code = code;
                registerCode.count = count;
                //设置验证码有效时间
                registerCode.expire = moment().add('minutes', 10).valueOf();
                registerCode.save(function(err) {
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
                      data: code
                    });
                  }
                });
              } else {
                res.json({
                  ret: -1,
                  message: err
                });
              }
            });
          }
        });
      }
    }
  });
};

/**
 * 校验短信验证码
 */
exports.checksmscode = function(req, res) {

  var mobile = req.body.mobile;
  var code = req.body.code;

  UserAuthCode.findOne({
    mobile: mobile,
    code: code,
    isUse: false
  }).exec(function(err, userAuthCode) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (!userAuthCode) {
        return res.json({
          ret: -1,
          code: ErrorCode.AUTH_CODE_ERROR.code,
          msg: ErrorCode.AUTH_CODE_ERROR.desc
        });
      } else {
        //校验验证码是否在有效时间内，如失效修改其状态为已使用。
        if (userAuthCode.expire <= Date.now()) {
          return res.json({
            ret: -1,
            code: ErrorCode.AUTH_CODE_TIMEOUT.code,
            msg: ErrorCode.AUTH_CODE_TIMEOUT.desc
          });
        } else {
          return res.json({
            ret: 1,
            msg: ErrorCode.SUCCESS.desc
          });
        }
      }
    }
  });
};

/**
 * 获取认证Token
 */
exports.authenticate = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      return res.json({
        ret: -1,
        code: ErrorCode.USER_OR_PASSWORD_WRONG.code,
        msg: ErrorCode.USER_OR_PASSWORD_WRONG.desc
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          return res.json({
            ret: -1,
            message: err
          });
        } else {
          //var expires = moment().add('days', 100).valueOf();

          User.findOne(user._id)
            .populate('events', 'name')
            .exec(function(err, user) {
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
                    user: user,
                    //expires: expires,
                    //token: token
                  }
                });
              }
            });

          /*var token = jwt.encode({
            iss: user.mobile,
            exp: expires
          }, config.secret);*/

          /*User.update({
            mobile: user.mobile
          }, {
            $set: {
              expires: expires,
              token: token,
              'meta.lastLoginAt': new Date()
            }
          }, function(err) {
            if (err) {
              return res.json({
                ret: -1,
                code: ErrorCode.DATABASE_ERROR.code,
                msg: errorHandler.getErrorMessage(err)
              });
            } else {
              User.findOne(user._id)
              .populate('events', 'name')
              .exec(function(err, user) {
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
                      user: user,
                      expires: expires,
                      token: token
                    }
                  });
                }
              });
            }
          });*/
        }
      });
    }
  })(req, res, next);
};


exports.signup = function(req, res, next) {
  var regx = /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/;
  if (!req.body.mobile || !regx.exec(req.body.mobile)) {
    return res.json({
      ret: -1,
      code: ErrorCode.MOBILE_FORMAT_ERROR.code,
      msg: ErrorCode.MOBILE_FORMAT_ERROR.desc
    });
  }

  var regx = /.+\@.+\..+/;
  if (!req.body.email || !regx.exec(req.body.email)) {
    return res.json({
      ret: -1,
      code: ErrorCode.EMAIL_FORMAT_ERROR.code,
      msg: ErrorCode.EMAIL_FORMAT_ERROR.desc
    });
  }

  User.findOne({
    mobile: req.body.mobile
  }).exec(function(err, user) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (user) {
        return res.json({
          ret: -1,
          msg: ErrorCode.MOBILE_ALREADY_EXIST.desc,
          code: ErrorCode.MOBILE_ALREADY_EXIST.code
        });
      } else {
        User.findOne({
          email: req.body.email
        }).exec(function(err, user) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          } else {
            if (user) {
              return res.json({
                ret: -1,
                msg: ErrorCode.EMAIL_ALREADY_EXIST.desc,
                code: ErrorCode.EMAIL_ALREADY_EXIST.code
              });
            } else {
              var user = new User(req.body);
              var code = req.body.code;

              UserAuthCode.findOne({
                mobile: req.body.mobile,
                code: code,
                isUse: false
              }).exec(function(err, userAuthCode) {
                if (err) {
                  return res.json({
                    ret: -1,
                    code: ErrorCode.DATABASE_ERROR.code,
                    msg: errorHandler.getErrorMessage(err)
                  });
                } else {
                  if (!userAuthCode) {
                    return res.json({
                      ret: -1,
                      code: ErrorCode.AUTH_CODE_ERROR.code,
                      msg: ErrorCode.AUTH_CODE_ERROR.desc
                    });
                  } else {
                    //校验验证码是否在有效时间内，如失效修改其状态为已使用。
                    if (userAuthCode.expire <= Date.now()) {
                      UserAuthCode.update({
                        mobile: req.body.mobile,
                        code: code
                      }, {
                        $set: {
                          isUse: true
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
                            code: ErrorCode.AUTH_CODE_TIMEOUT.code,
                            msg: ErrorCode.AUTH_CODE_TIMEOUT.desc
                          });
                        }
                      });
                    } else {
                      user.nickname = 't' + user.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                      user.save(function(err) {
                        if (err) {
                          return res.json({
                            ret: -1,
                            code: ErrorCode.DATABASE_ERROR.code,
                            msg: errorHandler.getErrorMessage(err)
                          });
                        } else {
                          // Remove sensitive data before login
                          user.password = undefined;
                          user.salt = undefined;

                          req.login(user, function(err) {
                            if (err) {
                              return res.json({
                                ret: -1,
                                message: err
                              });
                            } else {

                              var expires = moment().add('days', 60).valueOf();
                              var token = jwt.encode({
                                iss: user.mobile,
                                exp: expires
                              }, config.secret);

                              User.update({
                                mobile: user.mobile
                              }, {
                                $set: {
                                  expires: expires,
                                  token: token,
                                  'meta.lastLoginAt': new Date()
                                }
                              }, function(err) {
                                if (err) {
                                  return res.json({
                                    ret: -1,
                                    code: ErrorCode.DATABASE_ERROR.code,
                                    msg: errorHandler.getErrorMessage(err)
                                  });
                                } else {
                                  User.findOne(user._id)
                                    .populate('events', 'name')
                                    .exec(function(err, user) {
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
                                            user: user,
                                            expires: expires,
                                            token: token
                                          }
                                        });
                                      }
                                    });
                                }
                              });
                              //更新短信验证码状态为已使用
                              UserAuthCode.update({
                                mobile: req.body.mobile,
                                code: req.body.code
                              }, {
                                $set: {
                                  isUse: true
                                }
                              }, function(err) {
                                if (err) {
                                  return res.json({
                                    ret: -1,
                                    code: ErrorCode.DATABASE_ERROR.code,
                                    msg: errorHandler.getErrorMessage(err)
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  }
                }
              });
            }
          }
        });
      }
    }
  });
};


exports.signin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      return res.json({
        ret: -1,
        message: info.message
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          return res.json({
            ret: -1,
            message: err
          });
        } else {
          return res.json({
            ret: 1,
            msg: ErrorCode.SUCCESS.desc,
            user: user
          });
        }
      });
    }
  })(req, res, next);
};


exports.signout = function(req, res) {
  req.logout();
  res.json({
    message: 'signout success'
  });
};


/**
 * 该接口仅提供给WEB管理台登陆
 */
exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      return res.json({
        ret: -1,
        code: ErrorCode.USER_OR_PASSWORD_WRONG.code,
        msg: ErrorCode.USER_OR_PASSWORD_WRONG.desc
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      if (user.roles[0] === 'admin') {
        req.login(user, function(err) {
          if (err) {
            return res.json({
              ret: -1,
              message: err
            });
          } else {

            var expires = moment().add(7, 'days').valueOf();
            var token = jwt.encode({
              iss: user.mobile,
              exp: expires
            }, config.secret);

            return res.json({
              ret: 1,
              msg: ErrorCode.SUCCESS.desc,
              expires: expires,
              token: token
            });

          }
        });
      } else {
        return res.json({
          'message': '只有管理员权限才可以登录'
        });
      }
    }
  })(req, res, next);
};


exports.resetpasswd = function(req, res, next) {

  var mobile = req.body.mobile;
  var code = req.body.code;
  var password = req.body.password;

  UserAuthCode.findOne({
    mobile: mobile,
    code: code,
    isUse: false
  }).exec(function(err, userAuthCode) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      if (!userAuthCode) {
        return res.json({
          ret: -1,
          code: ErrorCode.AUTH_CODE_ERROR.code,
          msg: ErrorCode.AUTH_CODE_ERROR.desc
        });
      } else {
        //校验验证码是否在有效时间内，如失效修改其状态为已使用。
        if (userAuthCode.expire <= Date.now()) {
          UserAuthCode.update({
            mobile: mobile,
            code: code
          }, {
            $set: {
              isUse: true
            }
          }, function(err) {
            if (err) {
              return res.json({
                ret: -1,
                message: 'update smscode error'
              });
            } else {
              return res.json({
                ret: -1,
                code: ErrorCode.AUTH_CODE_TIMEOUT.code,
                msg: ErrorCode.AUTH_CODE_TIMEOUT.desc
              });
            }
          });
        } else {
          //找到该用户
          User.findOne({
            mobile: mobile
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
                code: ErrorCode.USER_NOT_EXIST.code,
                msg: ErrorCode.USER_NOT_EXIST.desc
              });
            }
            //更新密码
            user.password = password;
            user.save(function(err) {
              if (err) {
                return res.json({
                  ret: -1,
                  code: ErrorCode.DATABASE_ERROR.code,
                  msg: errorHandler.getErrorMessage(err)
                });
              } else {
                //更新验证码使用状态
                UserAuthCode.update({
                  mobile: mobile,
                  code: code
                }, {
                  $set: {
                    isUse: true
                  }
                }, function(err) {
                  if (err) {
                    return res.json({
                      ret: -1,
                      message: 'update smscode error'
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
          });
        }
      }
    }
  });
};
