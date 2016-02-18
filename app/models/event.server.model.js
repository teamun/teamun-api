'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 活动项目
 * name: 项目名称
 * logo: 项目logo
 * //teams: 相关队部
 */
var EventSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: '',
    unique: '该名称已被使用',
    required: '请填写项目名称'
  },
  logo: {
    type: String,
    trim: true,
    default: ''
  },
  // teams: [{
  //   type: Schema.ObjectId,
  //   ref: 'Team'
  // }],
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

EventSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Event', EventSchema);
