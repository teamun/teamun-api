'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 消息提醒二级消息体
 * activity: 活动对象
 * officialAction: 动态对象
 * notification: 提醒父对象
 * type: 1:发布成功 2:活动取消 3:活动报名 4:活动提醒
 * title: 标题
 * content: 内容
 * isread: 是否已读
 * parentType: 1:活动 2:动态
 */
var NotificationBodySchema = new Schema({
  activity: {
    type: Schema.ObjectId,
    ref: 'Activity'
  },
  officialAction: {
    type: Schema.ObjectId,
    ref: 'OfficialAction'
  },
  notification: {
    type: Schema.ObjectId,
    ref: 'Notification'
  },
  type: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  isread: {
    type: Boolean,
    default: false
  },
  parentType: {
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

NotificationBodySchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('NotificationBody', NotificationBodySchema);