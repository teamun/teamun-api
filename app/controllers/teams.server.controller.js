'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  Team = mongoose.model('Team'),
  Event = mongoose.model('Event');


exports.create = function(req, res) {
  var team = new Team(req.body);
  team.save(function(err) {;
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
        data: {team: team}
      });
    }
  });
};


exports.list = function(req, res) {
  Team.find(function(err, teams) {
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
        data: {teams: teams}
      });
    }
  });
};


exports.findOne = function(req, res) {
  Team.find({
    _id: req.params.teamID
  }).populate({
    path: 'events captain'
  }).exec(function(err, team) {
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
        data: {team: team}
      });
    }
  });
};


exports.update = function(req, res) {
  var team = req.team;
  if (req.body.events) {
    var event_array = [];
    for (var i = 0; i < req.body.events.length; i++) {
      event_array.push(req.body.events[i]._id);
    };
    req.body.events = event_array;
  }
  if(req.body.captain) {
    req.body.captain = req.body.captain[0]._id;
  }
  team = _.extend(team, req.body);
  team.save(function(err) {
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
        data: {team: team}
      });
    }
  });
};


exports.recommendList = function(req, res) {
  Team.find({
    isRecommend: true
  }, function(err, teams) {
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
        data: {teams: teams}
      });
    }
  });
};


exports.recommendRemove = function(req, res) {
  var team = req.team;
  if (req.body.events) {
    var event_array = [];
    for (var i = 0; i < req.body.events.length; i++) {
      event_array.push(req.body.events[i]._id);
    };
    req.body.events = event_array;
  }
  req.body.isRecommend = false;
  team = _.extend(team, req.body);
  team.save(function(err) {
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
        data: {team: team}
      });
    }
  });
};


/**
 * Team middleware
 */
exports.teamByID = function(req, res, next, id) {
  Team.findById(id).exec(function(err, team) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    }
    if (!team) {
      return res.json({
        ret: -1,
        code: ErrorCode.TEAM_NOT_EXIST.code,
        msg: ErrorCode.TEAM_NOT_EXIST.desc
      });
    }
    req.team = team;
    next();
  });
};
