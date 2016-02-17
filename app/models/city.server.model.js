'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

/**
 * City 全国城市
 */
var CitySchema = new Schema({
  label: {
    type: String,
    trim: true,
    default: '',
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  pinyin: {
    type: String,
    trim: true,
    default: '',
  },
  zip: {
    type: String,
    trim: true,
    default: '',
  }
})

module.exports = mongoose.model('City', CitySchema);
