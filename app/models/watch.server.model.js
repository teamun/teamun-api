'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 关注/粉丝
 * follower: 粉丝
 * following: 关注
 * status: 是否互相关注
 */
var WatchSchema = new Schema({
  follower: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  following: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  status: {
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

WatchSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Watch', WatchSchema);
