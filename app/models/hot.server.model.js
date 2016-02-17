'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 热门
 * title: 标题
 * poster: 海报
 * url: url
 * activityId: 活动ID
 * category: app or site
 */
var HotSchema = new Schema({
  title: {
    type: String,
    trim: true,
    default: '',
    required: '请填写标题'
  },
  poster: {
    type: String,
    trim: true,
    default: ''
  },
  url: {
    type: String,
    trim: true
  },
  activityId: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: [{
      type: String,
      enum: ['app', 'site']
    }],
    default: ['site']
  },
  category: {
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

HotSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Hot', HotSchema);
