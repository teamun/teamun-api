'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 个人荣誉
 * playerLevels: 运动员等级
 * professionLevels: 职业等级
 * honorMedals: 荣誉勋章
 * expertLevels: 达人等级
 */
var HonorPersonalSchema = new Schema({
  playerLevels: {
    type: Schema.ObjectId,
    ref: 'PlayerLevel'
  },
  professionLevels: {
    type: Schema.ObjectId,
    ref: 'ProfessionLevel'
  },
  honorMedals: {
    type: Schema.ObjectId,
    ref: 'HonorMedal'
  },
  expertLevels: {
    type: Schema.ObjectId,
    ref: 'ExpertLevel'
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

HonorPersonalSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('HonorPersonal', HonorPersonalSchema);
