'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * GroupMembers
 * 活动报名成员模板实体
 */
var GroupMembersSchema = new Schema({
  userId: {
    type: String,
    trim: true,
    default: ''
  },
  mobile: {
    type: String,
    trim: true,
    default: ''
  },
  nickname: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    trim: true,
    default: ''
  },
  groupId: {
    type: String,
    trim: true,
    default: ''
  },
  groupName: {
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
    default: ''
  },
  isSafe: {
    type: Boolean,
    default: false
  },
  isCaptain: {
    type: Boolean,
    default: false
  },
  activityId: {
    type: String,
    trim: true,
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
    }
  }
})

GroupMembersSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('GroupMembers', GroupMembersSchema);
