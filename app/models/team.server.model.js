'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 队部
 * name: 队部名称
 * city: 所在城市
 * desc: 队部描述
 * logo: 队标logo
 * ispublic: 是否公开
 * isRecommend: 是否官网推荐
 * event: 相关活动项目
 * events: 相关活动项目
 * captain: 队长
 * managers: 管理员
 * members: 队部成员
 */
var TeamSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: '',
    unique: '该名称已被使用',
    required: '请填写名称'
  },
  city: {
    type: String,
    trim: true,
    default: '',
    required: '请填写城市'
  },
  desc: {
    type: String,
    trim: true,
    default: ''
  },
  logo: {
    type: String,
    trim: true,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isRecommend: {
    type: Boolean,
    default: false
  },
  event: {
    type: Schema.ObjectId,
    ref: 'Event'
  },
  events: [{
    type: Schema.ObjectId,
    ref: 'Event'
  }],
  captain: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  managers: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: Schema.ObjectId,
    ref: 'User'
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

TeamSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Team', TeamSchema);
