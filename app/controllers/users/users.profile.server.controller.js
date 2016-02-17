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
  User = mongoose.model('User'),
  Activity = mongoose.model('Activity'),
  ActivityStatus = require('../../utils/enum/activityStatus.js'),
  OfficialActionType = require('../../utils/enum/officialActionType.js'),
  OfficialActionStatus = require('../../utils/enum/officialActionStatus.js');


exports.admins = function(req, res) {
  User.find()
    .where('roles').equals('admin')
    .exec(function(err, users) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          ret: 1,
          msg: ErrorCode.SUCCESS.desc,
          data: {users: users}
        });
      }
    });
};


exports.list = function(req, res) {
  User.find()
    .where('roles').in(['member', 'captain', 'normal'])
    .exec(function(err, users) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json({
          ret: 1,
          msg: ErrorCode.SUCCESS.desc,
          data: {users: users}
        });
      }
    });
};


exports.create = function(req, res) {
  if (req.isAuthenticated()) {
    var user = new User(req.body);
    if (req.user.roles[0] === 'admin') {
      user.save(function(err) {
        if (err) {
          return res.json({
            ret: -1,
            code: ErrorCode.DATABASE_ERROR.code,
            msg: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json({
            ret: 1,
            msg: ErrorCode.SUCCESS.desc,
            data: {user: user}
          });
        }
      });
    } else {
      res.json({
        'message': '没有权限'
      });
    }
  } else {
    res.json({
      'message': '没有认证'
    });
  }

};


exports.delete = function(req, res) {
  var user = req.user;

  user.remove(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {user: user}
      });
    }
  });
};


exports.findOne = function(req, res) {
  User.find({
    _id: req.params.userID
  }).populate({
    path: 'menus teams'
  }).exec(function(err, user) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {user: user}
      });
    }
  });
};


exports.findOneByMobile = function(req, res) {
  User.findOne({
    mobile: req.params.mobile
  }).populate({
    path: 'menus teams'
  }).exec(function(err, user) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {user: user}
      });
    }
  });
};


var updateUserBody = function(req, res, user, body) {
  if (body.menus) {
    var menu_array = [];
    for (var i = 0; i < body.menus.length; i++) {
      menu_array.push(body.menus[i]._id);
    }
    body.menus = menu_array;
  }
  if (body.teams) {
    var team_array = [];
    for (var i = 0; i < body.teams.length; i++) {
      team_array.push(body.teams[i]._id);
    }
    body.teams = team_array;
  }
  if (body.events) {
    var event_array = [];
    for (var i = 0; i < body.events.length; i++) {
      event_array.push(body.events[i]._id);
    }
    body.events = event_array;
  }
  user = _.extend(user, body);
  user.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {user: user}
      });
    }
  });
};


exports.update = function(req, res) {
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
          code: ErrorCode.USER_NOT_EXIST.code,
          msg: ErrorCode.USER_NOT_EXIST.desc
        });
      } else {
        updateUserBody(req, res, user, req.body);
      }
    });
  } else {
    var user = req.user;
    updateUserBody(req, res, user, req.body);
  }
};


//提供移动端活动报名处更新用户信息
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
      };
      if (!user) {
        return res.json({
          ret: -1,
          code: ErrorCode.USER_NOT_EXIST.code,
          msg: ErrorCode.USER_NOT_EXIST.desc
        });
      } else {
        var body = JSON.parse(req.body.user);
        //更新兴趣项目
        if (body.events) {
          var event_array = [];
          for (var i = 0; i < body.events.length; i++) {
            event_array.push(body.events[i]._id);
          }
          body.events = event_array;
        };
        user = _.extend(user, body);
        user.save(function(err) {
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
                    user: user
                  }
                }); 
              }
            });
          };
        });
      };
    });
  };
};


exports.findActivities = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if(token) {
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

    User.findOne({token: token}, 'activities').exec(function(err, user) {
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
          code: ErrorCode.USER_NOT_EXIST.code,
          msg: ErrorCode.USER_NOT_EXIST.desc
        });
      };
      if(!user.activities || user.activities.length === 0) {
        return res.json({
          ret: 1,
          msg: ErrorCode.SUCCESS.desc,
          data: {
            activities: null,
            hasmore: false,
            statusMap: ActivityStatus.statusCodeMap
          }
        });
      };
      var count = user.activities.length;
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
      if(count > 0) {
        User.findOne({token: token}).deepPopulate('activities', {
          whitelist: [
            'activities'
          ],
          populate: {
            'activities': {
              select: 'activities',
              options: {
                sort: {'meta.createAt': -1},
                limit: queryParameters.limit,
                skip: queryParameters.skip
              }
            },
          }
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
              code: ErrorCode.USER_NOT_EXIST.code,
              msg: ErrorCode.USER_NOT_EXIST.desc
            });
          } else {
            User.deepPopulate(user, 'activities.activityGroups activities.captain activities.event', {
              whitelist: [
                'activities.activityGroups',
                'activities.captain',
                'activities.event'
              ],
              populate: {
                'activities.captain': {
                  select: 'nickname avatar'
                },
                'activities.activityGroups': {
                  select: 'users'
                },
                'activities.event': {
                  select: 'name'
                }
              }
            }, function (err, activities) {
              return res.json({
                ret: 1,
                msg: ErrorCode.SUCCESS.desc,
                data: {
                  activities: activities.activities,
                  hasmore: hasmore,
                  statusMap: ActivityStatus.statusCodeMap
                }
              });
            });
          }
        });
      };
    });
  };
};


exports.findOfficialActions = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if(token) {
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

    User.findOne({token: token}, 'officialActions').exec(function(err, user) {
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
          code: ErrorCode.USER_NOT_EXIST.code,
          msg: ErrorCode.USER_NOT_EXIST.desc
        });
      };
      if(!user.officialActions || user.officialActions.length === 0) {
        return res.json({
          ret: 1,
          msg: ErrorCode.SUCCESS.desc,
          data: {
            officialActions: null,
            hasmore: false,
            statusMap: OfficialActionStatus.statusCodeMap,
            typeMap: OfficialActionType.typeCodeMap
          }
        });
      };
      var count = user.officialActions.length;
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
      if(count > 0) {
        User.findOne({token: token}).deepPopulate('officialActions', {
          whitelist: [
            'officialActions'
          ],
          populate: {
            'officialActions': {
              select: 'officialActions',
              options: {
                sort: {'meta.createAt': -1},
                limit: queryParameters.limit,
                skip: queryParameters.skip
              }
            },
          }
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
              code: ErrorCode.USER_NOT_EXIST.code,
              msg: ErrorCode.USER_NOT_EXIST.desc
            });
          } else {
            User.deepPopulate(user, 'officialActions', {
              
            }, function (err, officialActions) {
              return res.json({
                ret: 1,
                msg: ErrorCode.SUCCESS.desc,
                data: {
                  officialActions: officialActions.officialActions,
                  hasmore: hasmore,
                  statusMap: OfficialActionStatus.statusCodeMap,
                  typeMap: OfficialActionType.typeCodeMap
                }
              });
            });
          }
        });
      }
    });

    //先进行身份验证
    // User.findOne({token: token}, 'officialActions')
    // .populate('officialActions', 'title poster type status source url publishTime')
    // .exec(function(err, user) {
    //   if (err) {
    //     return res.json({
    //       ret: -1,
    //       code: ErrorCode.DATABASE_ERROR.code,
    //       msg: errorHandler.getErrorMessage(err)
    //     });
    //   };
    //   if (!user) {
    //     return res.json({
    //       ret: -1,
    //       code: ErrorCode.USER_NOT_EXIST.code,
    //       msg: ErrorCode.USER_NOT_EXIST.desc
    //     });
    //   } else {
    //     return res.json({
    //       ret: 1,
    //       msg: ErrorCode.SUCCESS.desc,
    //       data: {
    //         officialActions: user.officialActions,
    //         statusMap: OfficialActionStatus.statusCodeMap,
    //         typeMap: OfficialActionType.typeCodeMap
    //       }
    //     }); 
    //   };
    // });
  };
};


exports.addTag = function(req, res) {
  User.findOne({
      _id: req.params.user_id
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
      } else {
        if (req.params.tag) {
          user.tags.push(req.params.tag);
        }
        User.update({
          _id: req.params.user_id
        }, {
          $set: {
            tags: user.tags
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
                user: user
              }
            }); 
          }
        });
      }
    });
};


exports.removeTag = function(req, res) {
  User.findOne({
      _id: req.params.user_id
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
      } else {
        if (req.params.tag) {
          for (var i = 0; i < user.tags.length; i++) {
            if(req.params.tag === user.tags[i]) {
              user.tags.splice(user.tags.indexOf(user.tags[i]), 1);
            }
          };
        }
        User.update({
          _id: req.params.user_id
        }, {
          $set: {
            tags: user.tags
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
                user: user
              }
            }); 
          }
        });
      }
    });
};


exports.me = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
  if(token) {
    //先进行身份验证
    User.findOne({
      token: token
    })
    .populate('events', 'name')
    .exec(function(err, user) {
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
          code: ErrorCode.USER_NOT_EXIST.code,
          msg: ErrorCode.USER_NOT_EXIST.desc
        });
      };
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {
          user: user
        }
      });
    });
  }
  // res.json({
  //   ret: 1,
  //   msg: ErrorCode.SUCCESS.desc,
  //   data: {user: req.user}
  // });
  // res.json(req.user || null);
};
