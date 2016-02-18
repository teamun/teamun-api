'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 分组
 * name: 分组名称
 * signTime: 开始报名时间
 * deadlineTime: 报名结束时间
 * numLimit: 人数限制
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
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('ActivityGroup', ActivityGroupSchema);
