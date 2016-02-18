'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 微信活动
 * name: 活动名称
 * posters: 活动海报
 * startTime: 开始时间
 * endTime: 结束时间
 * location: 活动地点
 * address: 详细地址
 * desc: 活动描述
 * longitude: 经度
 * latitude: 纬度
 * nickname: 微信昵称
 * headimgurl: 微信头像
 * openid: openid
 * joinRecord: 加入记录
 */
var WechatActivitySchema = new Schema({
  name: {
    type: String,
    required: '请填写名称'
  },
  posters: [{
    type: String
  }],
  startTime: {
    type: Date,
    required: '请填写开始时间'
  },
  endTime: {
    type: Date,
    required: '请填写结束时间'
  },
  location: {
    type: String,
    required: '请选择活动地点'
  },
  address: {
    type: String,
    default: ''
  },
  desc: {
    type: String,
    required: '请填写活动描述'
  },
  longitude: {
    type: Number,
    default: 0
  },
  latitude: {
    type: Number,
    default: 0
  },
  nickname: {
    type: String
  },
  headimgurl: {
    type: String
  },
  openid: {
    type: String
  },
  joinRecord: [{
    type: Schema.ObjectId,
    ref: 'WechatActivityJoinRecord'
  }],
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

WechatActivitySchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('WechatActivity', WechatActivitySchema);
