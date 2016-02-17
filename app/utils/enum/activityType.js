'use strict';

/**
 * 活动类型 CODE 及 MAP
 */

var typeCode = {

  ACTIVITY_PUBLIC: {code: 0, desc: '公开'},
  ACTIVITY_PRIVATE: {code: 1, desc: '私密'},

};

var typeCodeMap = {

  0: '公开',
  1: '私密'
  
};

exports.typeCode = typeCode;
exports.typeCodeMap = typeCodeMap;