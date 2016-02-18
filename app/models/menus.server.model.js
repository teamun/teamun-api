'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 管理后台菜单
 * name: 菜单名称
 * url: 菜单url
 * level: 菜单级别（父、子）
 * parent: 父菜单
 * icon: 菜单图标
 */
var MenuSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: '',
    unique: '该名称已被使用',
    required: '请填写项目名称'
  },
  url: {
    type: String,
    trim: true,
    default: ''
  },
  level: {
    type: Number,
    default: 1
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'Menu'
  },
  icon: {
    type: String
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

MenuSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('Menu', MenuSchema);
