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


exports.createForAdmin = function(req, res) {
  var organizer = new Organizer(req.body);
  organizer.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        data: {organizer: organizer}
      });
    }
  });
};


exports.listForAdmin = function(req, res) {
  Organizer.find({})
  .populate({path: 'captains'})
  .exec(function(err, organizers) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        data: {organizers: organizers}
      });
    }
  });
};


exports.findOneForAdmin = function(req, res) {
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
        data: {organizer: organizer}
      });
    }
  });
};


exports.updateForAdmin = function(req, res) {
  var organizer = req.organizer;
  if (req.body.captain) {
    //把该单位更新到user.organizers用户单位列表
    User.findOne({
      _id: req.body.captain
    }).exec(function(err, user) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        var user_organizer_array = [];
        user_organizer_array = user.organizers;
        if(user_organizer_array.indexOf(organizer._id) == -1) {
          user_organizer_array.push(organizer._id);
        }
        user.organizers = user_organizer_array;  
        User.update({
          _id: req.body.captain
        }, {
          $set: {
            organizers: user_organizer_array
          }
        }, function(err) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          }
        });
      }
    });
  
    var captain_array = [];
    captain_array = organizer.captains;
    if(captain_array.indexOf(req.body.captain) == -1) {
      captain_array.push(req.body.captain);
    }
    req.body.captains = captain_array;
  } else {
    req.body.captains = organizer.captains;
  }
  organizer = _.extend(organizer, req.body);
  organizer.save(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        data: {organizer: organizer}
      });
    }
  });
};


exports.deleteForAdmin = function(req, res) {
  var organizer = req.organizer;
  organizer.remove(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json({
        ret: 1,
        data: {organizer: organizer}
      });
    }
  });
};


exports.removeCaptainForAdmin = function(req, res) {
  var organizer = req.organizer;
  if (req.params.userID) {
    //把该单位更新到user.organizers用户单位列表
    User.findOne({
      _id: req.params.userID
    }).exec(function(err, user) {
      if (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.DATABASE_ERROR.code,
          msg: errorHandler.getErrorMessage(err)
        });
      } else {
        var user_organizer_array = [];
        user_organizer_array = user.organizers;
        user_organizer_array.splice(user_organizer_array.indexOf(organizer._id), 1);
        user.organizers = user_organizer_array;  
        User.update({
          _id: req.params.userID
        }, {
          $set: {
            organizers: user_organizer_array
          }
        }, function(err) {
          if (err) {
            return res.json({
              ret: -1,
              code: ErrorCode.DATABASE_ERROR.code,
              msg: errorHandler.getErrorMessage(err)
            });
          }
        });
      }
    });

    var captain_array = [];
    captain_array = organizer.captains;
    captain_array.splice(captain_array.indexOf(req.params.userID), 1);
    req.body.captains = captain_array;
  }
  organizer = _.extend(organizer, req.body);
  organizer.save(function(err) {
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
        data: {organizer: organizer}
      });
    }
  });
};