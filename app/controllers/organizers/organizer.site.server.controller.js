'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  Organizer = mongoose.model('Organizer'),
  User = mongoose.model('User');


exports.listForSite = function(req, res) {
  User.findOne({
      mobile: req.params.mobile
    }, 'organizers')
    .populate('organizers', 'name')
    .exec(function(err, user) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        Organizer.findOne({
            type: 'presonal'
          }, 'name')
          .exec(function(err, organizer) {
            if (err) {
              return res.json({
                ret: -1,
                code: ErrorCode.DATABASE_ERROR.code,
                msg: errorHandler.getErrorMessage(err)
              });
            } else {
              if (user.organizers.length !== 0) {
                user.organizers.push(organizer);
                return res.json({
                  ret: 1,
                  data: user.organizers
                });
              } else {
                var singlearr = [];
                singlearr.push(organizer);
                return res.json({
                  ret: 1,
                  data: singlearr
                });
              }
            }
          });
      }
    });
};


exports.findOneForSite = function(req, res) {
  Organizer.findOne({
    _id: req.params.organizerID
  }).populate({
    path: 'captains'
  }).exec(function(err, organizer) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        data: {
          organizer: organizer
        }
      });
    }
  });
};
