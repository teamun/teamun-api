'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  User = mongoose.model('User'),
  Menu = mongoose.model('Menu');


exports.create = function(req, res) {
  var menu = new Menu(req.body);

  menu.save(function(err) {
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
        data: {menu: menu}
      });
    }
  });
};


exports.list = function(req, res) {
  Menu.find({})
  .populate({
    path: 'parent'
  })
  .sort('parent')
  .exec(function(err, menus) {
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
        data: {menus: menus}
      });
    }
  });

};


exports.ownedParents = function(req, res) {
  Menu.find({level: 0, _id: {$in:req.user.menus}}, function(err, parents) {
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
        data: {parents: parents}
      });
    }
  });
};


exports.parents = function(req, res) {
  Menu.find({level: 0}, function(err, parents) {
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
        data: {parents: parents}
      });
    }
  });
};


exports.children = function(req, res) {
  Menu.find({level: 1}, function(err, children) {
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
        data: {children: children}
      });
    }
  });
};


exports.delete = function(req, res) {
  var menu = req.menu;

  menu.remove(function(err) {
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
        data: {menu: menu}
      });
    }
  });
};


exports.findOne = function(req, res) {
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: {menu: req.menu}
  });
};


exports.update = function(req, res) {
  var menu = req.menu;
  menu = _.extend(menu, req.body);
  menu.save(function(err) {
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
        data: {menu: menu}
      });
    }
  });
};


/**
 * Menu middleware
 */
exports.menuByID = function(req, res, next, id) {
  Menu.findById(id).exec(function(err, menu) {
    if (err) return next(err);
    if (!menu) return next(new Error('Failed to load menu ' + id));
    req.menu = menu;
    next();
  });
};
