'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 微信公众号jsapi
 * appId: 微信公众号appid
 * appSecret: 微信公众号appsecret
 * ticket: api 访问 ticket
 * expire: 到期时间
 */
var JSAPITicketSchema = new Schema({
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
  ticket: {
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

JSAPITicketSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('JSAPITicket', JSAPITicketSchema);
