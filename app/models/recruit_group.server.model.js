'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 招募分组
 * name: 分组名称
 * signTime: 开始报名时间
 * deadlineTime: 报名结束时间
 * numLimit: 人数限制
 * status: 活动分组状态 
    0: '未开始',
    1: '报名中',
    2: '已满',
    3: '已结束'
 * officialAction: 归属动态(招募类型)
 * users: 分组成员
 */
var RecruitGroupSchema = new Schema({
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
  status: {
    type: Number,
    default: 0
  },
  officialAction: {
    type: Schema.ObjectId,
    ref: 'OfficialAction'
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

RecruitGroupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('RecruitGroup', RecruitGroupSchema);
