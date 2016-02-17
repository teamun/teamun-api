'use strict';

/**
 * 活动状态 CODE 及 MAP
 */

var statusCode = {

  ACTIVITY_WAITING_PUBLISH: {code: 0, desc: '待发布'},
  ACTIVITY_PUBLISHED: {code: 1, desc: '已发布'},
  ACTIVITY_SIGN_UP_ING: {code: 2, desc: '报名中'},
  ACTIVITY_BEGUN: {code: 3, desc: '已开始'},
  ACTIVITY_CANCEL: {code: 4, desc: '已取消'},
  ACTIVITY_DELETED: {code: 5, desc: '已删除'},

};

var statusCodeMap = {

  0: '待发布',
  1: '已发布',
  2: '报名中',
  3: '已开始',
  4: '已取消',
  5: '已删除'
  
};

exports.statusCode = statusCode;
exports.statusCodeMap = statusCodeMap;