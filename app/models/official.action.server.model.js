'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 官方动态
 * title: 标题
 * source: 来源
 * content: 内容
 * author: 作者
 * poster: 配图
 * publishTime: 发布时间
 * status: 状态 0: 待发布 1: 已发布
 * type: 0: 咨询 1: 招募
 * isRealInfo: 是否需要提交真实信息(招募报名)
 * url: 跳转url
 * recruitGroups: 招募分组
 * membersCount: 招募成员总数
 */
var OfficialActionSchema = new Schema({
  title: {
    type: String,
    trim: true,
    default: '',
    required: '请填写标题'
  },
  source: {
    type: String,
    trim: true,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  poster: {
    type: String,
    trim: true,
    default: ''
  },
  publishTime: {
    type: Date,
    default: ''
  },
  status: {
    type: Number,
    default: 0
  },
  type: {
    type: Number,
    default: 0
  },
  isRealInfo: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    trim: true
  },
  recruitGroups: [{
    type: Schema.ObjectId,
    ref: 'RecruitGroup'
  }],
  membersCount: {
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

OfficialActionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('OfficialAction', OfficialActionSchema);
