'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
  return (!this.updated || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
  return (password && password.length >= 6);
};

/**
 * 用户
 * nickname: 昵称
 * mobile: 手机号码 (账号)
 * email: 邮箱地址
 * wechat: 微信
 * weibo: 微博
 * qq: QQ
 * avatar: 头像
 * realname: 真实姓名
 * idcard: 身份证号码
 * sex: 性别 1:男 2:女
 * city: 城市
 * height: 身高
 * weight: 体重
 * isSafe: 是否已保险
 * points:
 * password: 密码
 * salt: 盐
 * roles: 角色
 * menus: 管理员所拥有的菜单
 * teams: 所在队部
 * events: 兴趣项目
 * activities: 相关活动
 * officialActions: 相关动态
 * organizers: 归属单位组织
 * emergencyName: 紧急联系人姓名
 * emergencyMobile: 紧急联系人电话
 * honorPersonals: 个人荣誉
 * follower: 粉丝
 * following: 关注
 * tags: 标签
 */
var UserSchema = new Schema({
  nickname: {
    type: String,
    trim: true,
    unique: '该昵称已被使用',
    required: '请填写昵称',
    validate: [validateLocalStrategyProperty, '请填写昵称']
  },
  mobile: {
    type: String,
    trim: true,
    unique: '该手机号码已被使用',
    required: '请填写手机号码',
    validate: [validateLocalStrategyProperty, '请填写手机号码'],
    match: [/^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|17[0-9]|14[57])[0-9]{8}$/, '请输入一个有效的手机号码']
  },
  email: {
    type: String,
    trim: true,
    unique: '该邮箱地址已被使用',
    required: '请填写邮箱地址',
    validate: [validateLocalStrategyProperty, '请填写邮箱地址'],
    match: [/.+\@.+\..+/, '请输入一个有效的邮箱地址']
  },
  wechat: {
    type: String,
    trim: true,
    default: ''
  },
  weibo: {
    type: String,
    trim: true,
    default: ''
  },
  qq: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    trim: true,
    default: ''
  },
  realname: {
    type: String,
    trim: true,
    default: ''
  },
  idcard: {
    type: String,
    trim: true,
    unique: '该身份证号码已被使用',
    match: [/(^\d{15}$)|(^\d{17}([0-9]|X)$)/, '请输入一个有效的身份证号码']
  },
  sex: {
    type: Number,
    default: 0
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  height: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  isSafe: {
    type: Boolean,
    default: false
  },
  // points: {
  //   type: Number,
  //   default: 0
  // },
  password: {
    type: String,
    default: '',
    validate: [validateLocalStrategyPassword, '密码长度不能小于6位']
  },
  salt: {
    type: String
  },
  tags: {
    type: Array
  },
  emergencyName: {
    type: String,
    trim: true,
    default: ''
  },
  emergencyMobile: {
    type: String,
    trim: true,
    default: ''
  },
  roles: {
    type: [{
      type: String,
      enum: ['admin', 'normal', 'captain']
    }],
    default: ['normal']
  },
  menus: [{
    type: Schema.ObjectId,
    ref: 'Menu'
  }],
  teams: [{
    type: Schema.ObjectId,
    ref: 'Team'
  }],
  events: [{
    type: Schema.ObjectId,
    ref: 'Event'
  }],
  activities: [{
    type: Schema.ObjectId,
    ref: 'Activity'
  }],
  officialActions: [{
    type: Schema.ObjectId,
    ref: 'OfficialAction'
  }],
  organizers: [{
    type: Schema.ObjectId,
    ref: 'Organizer'
  }],
  // emergencyContact: {
  //   type: Schema.ObjectId,
  //   ref: 'EmergencyContact'
  // },
  honorPersonals: {
    type: Schema.ObjectId,
    ref: 'HonorPersonal'
  },
  expires: {
    type: Date,
    default: Date.now()
  },
  token: {
    type: String,
    default: ''
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    },
    lastLoginAt: {
      type: Date,
      default: Date.now()
    }
  }
})

UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }
  if (this.isModified('password')) {
    if (this.password && this.password.length >＝ 6) {
      this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
      this.password = this.hashPassword(this.password);
    }
  }
  next();
})

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

UserSchema.plugin(deepPopulate);
module.exports = mongoose.model('User', UserSchema);
