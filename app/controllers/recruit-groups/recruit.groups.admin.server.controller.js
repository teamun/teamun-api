'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors.server.controller.js'),
  mongoose = require('mongoose'),
  ErrorCode = require('../../utils/enum/errorCode.js'),
  RecruitGroupStatus = require('../../utils/enum/recruitGroupStatus.js'),
  RecruitGroup = mongoose.model('RecruitGroup'),
  OfficialAction = mongoose.model('OfficialAction');


exports.createForAdmin = function(req, res) {
  var recruitGroup = new RecruitGroup(req.body);
  recruitGroup.save(function(err) {;
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {
      OfficialAction.findById(recruitGroup.officialAction).exec(function(err, action) {
        if (err) {
          return res.json({
            ret: -1,
            code: ErrorCode.DATABASE_ERROR.code,
            msg: errorHandler.getErrorMessage(err)
          });
        } else {
          action.recruitGroups.push(recruitGroup._id);
          action.save(function(err) {
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
                data: {
                  recruitGroup: recruitGroup
                }
              });
            }
          });
        }
      });
    }
  });
};


exports.findGroupsByActionIDForAdmin = function(req, res) {
  RecruitGroup.find({officialAction: req.params.actionID})
    .sort({'meta.createAt': -1})
    .exec(function(err, recruitGroups) {
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
          data: {
            recruitGroups: recruitGroups,
            statusMap: RecruitGroupStatus.statusCodeMap
          }
        });
      }
    });
};


exports.findOneForEditForAdmin = function(req, res) {
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: {
      recruitGroup: req.recruitGroup
    }
  });
};


exports.updateForAdmin = function(req, res) {
  var recruitGroup = req.recruitGroup;
  recruitGroup = _.extend(recruitGroup, req.body);
  recruitGroup.save(function(err) {
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
        data: {
          recruitGroup: recruitGroup
        }
      });
    }
  });
};


exports.deleteForAdmin = function(req, res) {
  var recruitGroup = req.recruitGroup;
  recruitGroup.remove(function(err) {
    if (err) {
      return res.json({
        ret: -1,
        code: ErrorCode.DATABASE_ERROR.code,
        msg: errorHandler.getErrorMessage(err)
      });
    } else {

      OfficialAction.findById(recruitGroup.officialAction).exec(function(err, action) {
        if (err) {
          return res.json({
            ret: -1,
            code: ErrorCode.DATABASE_ERROR.code,
            msg: errorHandler.getErrorMessage(err)
          });
        } else {
          //删除分组
          var group_array = [];
          group_array = action.recruitGroups;
          for (var i = 0; i < group_array.length; i++) {
            if(group_array[i].toString() == recruitGroup._id.toString()) {
              group_array.splice(group_array.indexOf(group_array[i]), 1);
            }
          };
          action.recruitGroups = group_array;
          action.save(function(err) {
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
                data: {
                  recruitGroup: recruitGroup
                }
              });
            }
          });
        }
      });
    }
  });
};
