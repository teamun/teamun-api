'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 动态
 * content: 内容
 * pictures: 配图
 * url: h5链接
 * like: 赞
 * type: 类型(1:个人、 2:队部)
 */
var ActionSchema = new Schema({
  content: {
    type: String
  },
  pictures: {
    type: String,
    trim: true,
    default: ''
  },
  url: {
    type: String,
    trim: true,
    default: ''
  },
  like: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  team: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type: {
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

ActionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Action', ActionSchema);
