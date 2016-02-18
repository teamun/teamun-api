'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * 紧急联系人
 * name: 联系人姓名
 * mobile: 联系人电话
 * relation: 与本人关系
 */
var EmergencyContactSchema = new Schema({
  name: {
    type: String,
    trim: true,
    default: '',
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^(0|86|17951)?(13[0-9]|15[012356789]|18[0-9]|14[57])[0-9]{8}$/, '请输入一个有效的手机号码']
  },
  relation: {
    type: String,
    trim: true,
    default: '',
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

EmergencyContactSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now();
  } else {
    this.meta.updateAt = Date.now();
  }

  next();
})

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
