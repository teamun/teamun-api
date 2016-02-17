'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 组织单位
 * name: 名称
 * logo: logo
 * desc: 组织描述
 * captains: 领队列表
 */
var OrganizerSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: '',
    required: '请填写名称'
  },
  logo: {
    type: String,
    trim: true,
    default: ''
  },
  desc: {
    type: String,
    default: ''
  },
  type: {
    type: [{
      type: String,
      enum: ['organize', 'personal']
    }],
    default: ['organize']
  },
  captains: [{
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

OrganizerSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Organizer', OrganizerSchema);
