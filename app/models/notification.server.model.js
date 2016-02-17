'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 消息提醒
 * activity: 活动对象
 * officialAction: 动态对象
 * notificationBodys: 二级消息数组
 * user: 归属用户
 * lastmsg: 最后一条提醒消息
 * type: 1: 活动 2: 官方动态
 * unreadcount: 未读消息数
 */
var NotificationSchema = new Schema({
  activity: {
    type: Schema.ObjectId,
    ref: 'Activity'
  },
  officialAction: {
    type: Schema.ObjectId,
    ref: 'OfficialAction'
  },
  notificationBodys: [{
    type: Schema.ObjectId,
    ref: 'NotificationBody'
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  lastmsg: {
    type: String,
    default: ''
  },
  type: {
    type: Number,
    default: 0
  },
  unreadcount: {
    type: Number,
    default: 0
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

NotificationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Notification', NotificationSchema);
