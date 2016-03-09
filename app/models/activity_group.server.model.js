'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  ActivityGroupOrder = require('./activity_group_order.server.model'),
  Q = require('q');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Schema = mongoose.Schema;

/**
 * A Validation function for local strategy 非负数验证
 * @params property
 * @return boolean
 */
var nonnegtiveValidation = function(property) {
  return (property >= 0);
};

/**
 * 分组
 * name: 分组名称
 * signTime: 开始报名时间
 * deadlineTime: 报名结束时间
 * numLimit: 人数限制
 * availablePlaces：剩余名额（新增 2016-03-03）
 * effectiveOrderNum：有效订单数量（新增 2016-03-03）
 * orders：该分组的所有订单
 * entryFee: 报名费
 * status: 活动分组状态
    0: '未开始',
    1: '报名中',
    2: '已满',
    3: '已结束'
 * feeDesc: 费用描述
 * activity: 归属活动
 * users: 分组成员
 */
var ActivityGroupSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  signTime: {
    type: Date,
    default: ''
  },
  deadlineTime: {
    type: Date,
    default: ''
  },
  numLimit: {
    type: Number,
    default: 0
  },
  availablePlaces: {
    type: Number,
    default: 0,
    validate: [nonnegtiveValidation, '剩余名额不足']
  },
  effectiveOrderNum: {
    type: Number,
    default: 0
  },
  orders: [{
    type: Schema.ObjectId,
    ref: 'ActivityGroupOrder'
  }],
  entryFee: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 0
  },
  feeDesc: {
    type: String,
    default: ''
  },
  activity: {
    type: Schema.ObjectId,
    ref: 'Activity'
  },
  users: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  isJoin: {
    type: Boolean,
    default: false
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

ActivityGroupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
    this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
});

ActivityGroupSchema.pre('validate', function(next) {
  if (this.isNew) {
    this.availablePlaces = this.numLimit;
  }
  next();
});

ActivityGroupSchema.methods.safeSave = function() {
  var group = this;
  return Q.Promise(function(resolve, reject, notify) {
    group.save(function(err) {
      if (err) {
        reject({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        resolve({
          ret: 1,
          msg: ErrorCode.SUCCESS.desc,
          data: {
            activityGroup: group
          }
        });
      }
    });
  });
}

/**
 * A Entity function 锁定名额
 * @return promise
 */
ActivityGroupSchema.methods.checkAndUpdateAvailablePlaces = function() {
    var group = this;
    return Q.Promise(function(resolve, reject, notify) {
      //查询该分组的有效订单数
      ActivityGroupOrder.countEffectiveOrders(group.activity, group._id)
        .then(function(count) {
          group.availablePlaces = group.numLimit - count;
          group.effectiveOrderNum = count;
          resolve(group);
        })
        .fail(function(err) {
          reject(err);
        });
    });
  }
  /**
   * A Entity function 锁定名额
   * @params places 名额数量
   * @return promise
   */
ActivityGroupSchema.methods.lockReservationAndCreateOrders = function(places, user) {
  var group = this;
  return Q.Promise(function(resolve, reject, notify) {
    //锁定成功创建订单
    ActivityGroupOrder.createOrder(user, group)
      .then(function(createOrderResult) {
        group.availablePlaces -= places;
        group.orders.push(createOrderResult._id);

        group.save(function(groupSaveErr) {
          if (groupSaveErr) {
            ActivityGroupOrder.remove({ _id: createOrderResult._id }, function(removeOrderErr) {});
            reject(groupSaveErr);
          }
          resolve(createOrderResult);
        });
      })
      .fail(function(createOrderErr) {
        reject(createOrderErr)
      });
  });
}

ActivityGroupSchema.methods.addMember = function(user) {
  this.users.push(user._id);
  this.save();
  user.activities.push(this.activity);
  user.save();
}

/**
 * A Entity function 预定名额
 * @params places 名额数量
 * @return promise
 */
ActivityGroupSchema.methods.reservePlaces = function(places, user) {
  var group = this;
  return Q.Promise(function(resolve, reject, notify) {
    //如果剩余名额足够，则直接锁定名额
    if (group.availablePlaces >= places) {
      //锁定名额
      group.lockReservationAndCreateOrders(places, user)
        .then(function(lockReservationAndCreateOrdersResult) {
          resolve({ ret: 1, code: ErrorCode.SUCCESS.code, msg: ErrorCode.SUCCESS.desc, data: { order: lockReservationAndCreateOrdersResult } }); //锁定成功！！！
        })
        .fail(function(lockReservationAndCreateOrdersErr) {
          reject({ ret: -1, code: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.code, msg: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.desc }); //锁定名额失败，请重试！！！
        });
    } else {
      //否则，判断有效订单是否已经达到名额上限
      if (group.effectiveOrderNum + places > group.numLimit) {
        //若达到名额上限，则返回0
        reject({ ret: -1, code: ErrorCode.ACTIVITY_GROUP_JOIN_NO_PLACES_ERROR.code, msg: ErrorCode.ACTIVITY_GROUP_JOIN_NO_PLACES_ERROR.desc }); //锁定名额失败，名额不足！！！
      } else {
        //否则，去订单中查询该分组的有效订单数
        group.checkAndUpdateAvailablePlaces()
          .then(function(group) {
            group.reservePlaces(places, user)
              .then(function(reservePlacesResult) {
                resolve(reservePlacesResult);
              })
              .fail(function(reservePlacesErr) {
                reject(reservePlacesErr);
              });
          })
          .fail(function(err) {
            reject({ ret: -1, code: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.code, msg: ErrorCode.ACTIVITY_GROUP_JOIN_UNKNOWN_ERROR.desc }); //锁定名额失败，请重试！！！
          });
      }
    }
  });
}

module.exports = mongoose.model('ActivityGroup', ActivityGroupSchema);
