'use strict';

/**
 * 活动分组状态 CODE 及 MAP
 */

var statusCode = {

  ACTIVITY_GROUP_SIGN_UP: {code: 0, desc: '未开始'},
  ACTIVITY_GROUP_SIGN_UP_ING: {code: 1, desc: '报名中'},
  ACTIVITY_GROUP_SIGN_UP_FULL: {code: 2, desc: '已满'},
  ACTIVITY_GROUP_SIGN_UP_CLOSE: {code: 3, desc: '已结束'},

};

var statusCodeMap = {

  0: '未开始',
  1: '报名中',
  2: '已满',
  3: '已结束'

};

exports.statusCode = statusCode;
exports.statusCodeMap = statusCodeMap;
