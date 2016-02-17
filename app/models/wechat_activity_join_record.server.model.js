'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 微信活动加入记录
 * openid: openid
 * nickname: 微信昵称
 * headimgurl: 微信头像
 * sex: 性别
 * language: 语言
 * city: 城市
 * province: 省份
 * country: 国家
 * subscribe_time: 订阅时间
 * activity: 加入活动
 */
var WechatActivityJoinRecordSchema = new Schema({
  openid: {
    type: String
  },
  nickname: {
    type: String
  },
  headimgurl: {
    type: String
  },
  sex: {
    type: String
  },
  language: {
    type: String
  },
  city: {
    type: String
  },
  province: {
    type: String
  },
  country: {
    type: String
  },
  subscribe_time: {
    type: Date,
    default: Date.now()
  },
  activity: {
    type: Schema.ObjectId,
    ref: 'WechatActivity'
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

WechatActivityJoinRecordSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
})


module.exports = mongoose.model('WechatActivityJoinRecord', WechatActivityJoinRecordSchema);
