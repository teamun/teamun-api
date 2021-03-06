'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 活动评论
 * activity: 活动对象
 * from: 评论用户
 * reply: 回复对象
 * reply.from: 回复人
 * reply.to: 被回复人
 * reply.content: 回复内容
 * content: 评论内容
 */
var CommentActivitySchema = new Schema({
  activity: {
    type: Schema.ObjectId,
    ref: 'Activity'
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

CommentActivitySchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('CommentActivity', CommentActivitySchema);
