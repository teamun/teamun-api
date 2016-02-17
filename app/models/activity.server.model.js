'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var crypto = require('crypto');

/**
 * 活动
 * name: 活动名称
 * level: 活动级别
 * mobile: 联系电话
 * startTime: 开始时间
 * summary: 活动概要
 * desc: 详细描述
 * status: 活动状态 
    0: '待发布',
    1: '已发布',
    2: '报名中',
    3: '已开始',
    4: '已取消',
    5: '已删除'
 * city: 举办城市
 * location: 详细地点
 * longitude: 经度
 * latidude: 纬度
 * poster: 活动海报
 * headerImgs: 头图
 * footerImgs 尾图
 * isSafe: 是否有保险
 * isEmergencyContact: 是否需要填写紧急联系人
 * isRealInfo: 是否提供真实信息
 * type: 公开 or 私密 ['public', 'private']
 * isSignIn: 是否发起签到
 * paymentWay: 付款方式
 * isRecommend: 是否官方首页推荐
 * event: 活动项目
 * team: 归属队部
 * user: 发起用户
 * activityGroups: 活动分组
 * organizer: 组织单位
 * captain: 活动领队
 * membersCount: 成员总数
 *
 *
 * 还没有实现的字段:
 * entryCondition: 报名条件
 * comment: 评论
 * roadBook: 路书
 * 
 */
var ActivitySchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: '',
    required: '请填写名称'
  },
  level: {
    type: Number,
    default: 0
  },
  mobile: {
    type: String,
    trim: true,
    default: '',
    required: '请填写手机号码'
  },
  startTime: {
    type: Date,
    default: ''
  },
  desc: {
    type: String,
    default: '',
    required: '请填写活动描述'
  },
  summary: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    default: 0
  },
  city: {
    type: String,
    trim: true,
    default: '',
    required: '请填写详城市'
  },
  location: {
    type: String,
    default: '',
    required: '请填写详细地点'
  },
  longitude: {
    type: Number,
    default: 0
  },
  latitude: {
    type: Number,
    default: 0
  },
  poster: {
    type: String,
    trim: true,
    default: ''
  },
  headerImgs: {
    type: Array
  },
  footerImgs: {
    type: Array
  },
  isSafe: {
    type: Boolean,
    default: false
  },
  isEmergencyContact: {
    type: Boolean,
    default: false
  },
  isRealInfo: {
    type: Boolean,
    default: false
  },
  type: {
    type: Number,
    default: 0
  },
  isRecommend: {
    type: Boolean,
    default: false
  },
  isSignIn: {
    type: Boolean,
    default: false
  },
  paymentWay: {
    type: Number,
    default: 0
  },
  event: {
    type: Schema.ObjectId,
    ref: 'Event'
  },
  team: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  activityGroups: [{
    type: Schema.ObjectId,
    ref: 'ActivityGroup'
  }],
  organizer: {
    type: Schema.ObjectId,
    ref: 'Organizer'
  },
  captain: {
    type: Schema.ObjectId,
    ref: 'User'
  },
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

ActivitySchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  next();
})

ActivitySchema.plugin(deepPopulate);
module.exports = mongoose.model('Activity', ActivitySchema);
