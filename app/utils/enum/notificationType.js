'use strict';

/**
 * 提醒消息类型 CODE 及 MAP
 */

var notificationCode = {

  NOTIFICATION_ACTIVITY: {code: 1, desc: '活动'},
  NOTIFICATION_OFFICIAL_ACTION: {code: 2, desc: '动态'}

};

var notificationCodeMap = {

  1: '活动',
  2: '动态'

};

exports.notificationCode = notificationCode;
exports.notificationCodeMap = notificationCodeMap;