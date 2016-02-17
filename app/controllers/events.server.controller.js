'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  Event = mongoose.model('Event'),
  Team = mongoose.model('Team');


exports.create = function(req, res) {
  var event = new Event(req.body);

  event.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {event: event}
      });
    }
  });
};


exports.list = function(req, res) {
  Event.find(function(err, events) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {events: events}
      });
    }
  });
};


exports.findOne = function(req, res) {
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: {event: req.event}
  });
};


exports.update = function(req, res) {
  var event = req.event;
  event = _.extend(event, req.body);
  event.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {event: event}
      });
    }
  });
};


exports.delete = function(req, res) {
  var event = req.event;

  event.remove(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        msg: ErrorCode.SUCCESS.desc,
        data: {event: event}
      });
    }
  });
};


/**
 * Event middleware
 */
exports.eventByID = function(req, res, next, id) {
  Event.findById(id).exec(function(err, event) {
    if (err) return next(err);
    if (!event) return next(new Error('Failed to load event ' + id));
    req.event = event;
    next();
  });
};
