'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

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
  }
})

module.exports = mongoose.model('GroupMembers', GroupMembersSchema);
