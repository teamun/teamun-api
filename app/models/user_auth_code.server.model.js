'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * UserAuthCode
 * mobile: 注册手机
 * code: 验证码
 * isUse: 是否使用
 * expire: 到期时间
 * count: 每天发送计数
 * ipaddr: 请求来源IP
 */
var UserAuthCodeSchema = new Schema({
  mobile: {
    type: String,
    trim: true,
    default: '',
  },
  code: {
    type: String,
    trim: true,
    default: ''
  },
  isUse: {
    type: Boolean,
    default: false
  },
  expire: {
    type: Date
  },
  count: {
    type: Number,
    default: 0
  },
  ipaddr: {
    type: String,
    trim: true,
    default: ''
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

UserAuthCodeSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('UserAuthCode', UserAuthCodeSchema);
