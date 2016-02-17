'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  Organizer = mongoose.model('Organizer');


/**
 * Organizer middleware
 */
exports.organizerByID = function(req, res, next, id) {
  Organizer.findById(id).exec(function(err, organizer) {
    if (err) return next(err);
    if (!organizer) return next(new Error('Failed to load organizer ' + id));
    req.organizer = organizer;
    next();
  });
};
