'use strict';

/**
 * 官网动态状态 CODE 及 MAP
 */

var statusCode = {

  ACTION_WAITING_PUBLISH: {code: 0, desc: '待发布'},
  ACTION_PUBLISHED: {code: 1, desc: '已发布'}

};

var statusCodeMap = {

  0: '待发布',
  1: '已发布'
  
};

exports.statusCode = statusCode;
exports.statusCodeMap = statusCodeMap;