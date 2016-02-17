'use strict';

/**
 * 热门类别 CODE 及 MAP
 */

var categoryCode = {

  CATEGORY_ACTIVITY: {code: 0, desc: '活动'},
  CATEGORY_NEWS: {code: 1, desc: '资讯'},
  CATEGORY_RECRUIT: {code: 2, desc: '招募'},
  CATEGORY_OUTLINK: {code: 3, desc: '外链'},

};

var categoryCodeMap = {

  0: '活动',
  1: '资讯',
  2: '招募',
  3: '外链'

};

exports.categoryCode = categoryCode;
exports.categoryCodeMap = categoryCodeMap;