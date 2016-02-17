'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * AccessToken
 * appId: 微信公众号appid
 * appSecret: 微信公众号appsecret
 * token: access token
 * expire: 到期时间
 */
var AccessTokenSchema = new Schema({
  appId: {
    type: String,
    trim: true,
    default: '',
  },
  appSecret: {
    type: String,
    trim: true,
    default: ''
  },
  token: {
    type: String
  },
  expire: {
    type: Date
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

AccessTokenSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('AccessToken', AccessTokenSchema);
