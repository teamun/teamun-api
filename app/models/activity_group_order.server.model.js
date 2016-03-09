'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  EXPIRE_TIMESTAMP = 1 * 60 * 1000;

/**
 * ActivityGroupOrder
 * 活动分组订单模板实体
 */
var ActivityGroupOrderSchema = new Schema({
  userId: {
    type: String,
    trim: true,
    default: ''
  },
  groupId: {
    type: String,
    trim: true,
    default: ''
  },
  activityId: {
    type: String,
    trim: true,
    default: ''
  },
  joiner: {
    realname: {
      type: String,
      trim: true,
      default: ''
    },
    idcard: {
      type: String,
      trim: true,
      default: ''
    },
    mobile: {
      type: String,
      trim: true,
      default: ''
    },
  },
  activityGroup: {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    entryFee: {
      type: Number,
      default: 0
    },
  },
  totalFee: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },
  meta: {
    createAt: {
      type: Number,
      default: Date.now()
    },
    updateAt: {
      type: Number,
      default: Date.now()
    }
  }
}, {
  versionKey: false
});

ActivityGroupOrderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

ActivityGroupOrderSchema.statics.updateInvalidOrders = function(user, group) {
  this.update({
      $and: [
        { activityId: group.activity, groupId: group._id, status: 1 },
        { userId: user._id },
        { 'meta.createAt': { $lt: Date.now() - EXPIRE_TIMESTAMP } }
      ]
    }, { $set: { status: 3 } }, { multi: true },
    function(err) {
      if (err) {
        console.log('TEAMUN_ERROR ActivityGroupOrderSchema.updateInvalidOrders:' + err);
      }
    });
}

ActivityGroupOrderSchema.statics.createOrder = function(user, group) {
  var order = new this();

  this.updateInvalidOrders(user, group);

  return Q.Promise(function(resolve, reject, notify) {
    order.userId = user._id;
    order.groupId = group._id;
    order.activityId = group.activity;

    order.joiner.realname = user.realname;
    order.joiner.idcard = user.idcard;
    order.joiner.mobile = user.mobile;

    order.activityGroup.name = group.name;
    order.activityGroup.entryFee = group.entryFee;
    order.totalFee = group.entryFee;

    order.save(function(err) {
      if (err) {
        reject({ ret: -1, code: ErrorCode.ACTIVITY_GROUP_ORDER_SAVE_ERROR.code, msg: ErrorCode.ACTIVITY_GROUP_ORDER_SAVE_ERROR.desc });
      }
      resolve(order);
    });
  });
}

ActivityGroupOrderSchema.statics.canCreateOrder = function(activityGroup, user) {
  var order = this;
  var userId = user._id;
  var activityId = activityGroup.activity;
  var groupId = activityGroup._id;
  return Q.Promise(function(resolve, reject, notify) {
    order.findCompleteOrder(activityId, groupId, userId)
      .then(function(findCompleteOrderResult) {
        if (findCompleteOrderResult) {
          //已经存在已支付的订单
          //更新ActivityGroup member
          activityGroup.addMember(user);

          reject({
            ret: -1,
            code: ErrorCode.ACTIVITY_GROUP_ORDER_COMPLETE_PAYMENT_ERROR.code,
            msg: ErrorCode.ACTIVITY_GROUP_ORDER_COMPLETE_PAYMENT_ERROR.desc
          });
        } else {
          order.findUncompleteAndEffectiveOrder(activityId, groupId, userId)
            .then(function(findUncompleteAndEffectiveOrderResult) {
              if (findUncompleteAndEffectiveOrderResult) {
                reject({
                  ret: 1,
                  code: ErrorCode.SUCCESS.code,
                  msg: ErrorCode.SUCCESS.desc,
                  data: {
                    order: findUncompleteAndEffectiveOrderResult
                  }
                });
              } else {
                resolve(true);
              }
            })
            .fail(function(findUncompleteAndEffectiveOrderErr) {
              reject({ ret: -1, code: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.code, msg: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.desc });
            });
        }
      })
      .fail(function(findCompleteOrderErr) {
        reject({ ret: -1, code: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.code, msg: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.desc });
      });
  });
}

ActivityGroupOrderSchema.statics.findCompleteOrder = function(activityId, groupId, userId) {
  var order = this;
  return Q.Promise(function(resolve, reject, notify) {
    order.findOne({
        $and: [
          { activityId: activityId, groupId: groupId, status: 2 },
          { userId: userId }
        ]
      })
      .sort({ 'meta.createAt': -1 })
      .exec(function(err, order) {
        if (err) {
          reject(err);
        }

        resolve(order);
      });
  });
}

ActivityGroupOrderSchema.statics.findUncompleteAndEffectiveOrder = function(activityId, groupId, userId) {
  var order = this;
  return Q.Promise(function(resolve, reject, notify) {
    order.findOne({
        $and: [
          { activityId: activityId, groupId: groupId, status: 1 },
          { userId: userId },
          { 'meta.createAt': { $gt: Date.now() - EXPIRE_TIMESTAMP } }
        ]
      })
      .sort({ 'meta.createAt': -1 })
      .exec(function(err, order) {
        if (err) {
          reject(err);
        }

        resolve(order);
      });

  });
}

ActivityGroupOrderSchema.statics.countEffectiveOrders = function(activityId, groupId) {
  var order = this;
  return Q.Promise(function(resolve, reject, notify) {
    order.count({
      $and: [
        { activityId: activityId },
        { groupId: groupId }, {
          $or: [
            { status: 2 },
            { status: 1, "meta.createAt": { $gt: Date.now() - EXPIRE_TIMESTAMP } }
          ]
        }
      ]
    }, function(err, count) {
      if (err) {
        reject(err);
      }
      resolve(count);
    });
  });
}

ActivityGroupOrderSchema.methods.safeSave = function() {
  var order = this;
  return Q.Promise(function(resolve, reject, notify) {
    order.save(function(err) {
      if (err) {
        reject({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        resolve({
          ret: 1,
          code: ErrorCode.SUCCESS.code,
          msg: ErrorCode.SUCCESS.desc,
          data: {
            order: order
          }
        });
      }
    });
  });
}

module.exports = mongoose.model('ActivityGroupOrder', ActivityGroupOrderSchema);
