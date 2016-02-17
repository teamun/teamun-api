'use strict';

/**
 * 提醒消息体二级类型 CODE 及 MAP
 */

var notificationBodyCode = {

  NOTIFICATION_BODY_ACTIVITY_SUCCESS: {code: 1, desc: '发布成功'},
  NOTIFICATION_BODY_ACTIVITY_CANCEL: {code: 2, desc: '活动取消'},
  NOTIFICATION_BODY_ACTIVITY_APPLY: {code: 3, desc: '活动报名'},
  NOTIFICATION_BODY_ACTIVITY_NOTIFY: {code: 4, desc: '活动提醒'},
  NOTIFICATION_BODY_OFFICIAL_ACTION_APPLY: {code: 5, desc: '动态报名'},
  NOTIFICATION_BODY_OFFICIAL_ACTION_NOTIFY: {code: 6, desc: '动态提醒'}

};

var notificationBodyCodeMap = {

  1: '发布成功',
  2: '活动取消',
  3: '活动报名',
  4: '活动提醒',
  5: '动态报名',
  6: '动态提醒'

};

exports.notificationBodyCode = notificationBodyCode;
exports.notificationBodyCodeMap = notificationBodyCodeMap;