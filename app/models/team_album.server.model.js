'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * 队部相册
 * photos: 相片数组
 * team: 归属队部
 * creator: 创建者
 */
var TeamAlbumSchema = new Schema({
  photos: {
    type: String,
    trim: true,
    default: ''
  },
  team: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
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

TeamAlbumSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('TeamAlbum', TeamAlbumSchema);
