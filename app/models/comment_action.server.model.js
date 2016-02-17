'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 动态评论
 * activity: 活动对象
 * from: 评论用户
 * reply: 回复对象
 * reply.from: 回复人
 * reply.to: 被回复人
 * reply.content: 回复内容
 * content: 评论内容
 */
var CommentActionSchema = new Schema({
  action: {
    type: Schema.ObjectId,
    ref: 'Action'
  },
  from: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  reply: [{
    from: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    to: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    content: String
  }],
  content: String,
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

CommentActionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('CommentAction', CommentActionSchema);
