'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 荣誉勋章
 * name: 勋章名称
 * logo: 勋章logo
 * desc: 勋章描述
 */
var HonorMedalSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  logo: {
    type: String,
    trim: true,
    default: ''
  },
  desc: {
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

HonorMedalSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('HonorMedal', HonorMedalSchema);
