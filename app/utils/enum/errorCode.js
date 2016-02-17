'use strict';

var ErrorCode = {

  SUCCESS: {code: 1000, desc: 'success'},

  DATABASE_ERROR: {code: 1001, desc: '数据库错误'},
  
  PARAM_NOT_ENOUGH: {code: 1002, desc: '缺少参数'},
  PARAMS_ERRORS: {code: 1003, desc: '参数错误'},
  PAGINATE_ERROR: {code: 1004, desc: '分页参数错误'},

  ACCESS_TOKEN_NO_PROVIDED: {code: 1005, desc: '请提供访问TOKEN'},
  ACCESS_TOKEN_EXPIRED: {code: 1006, desc: '访问TOKEN已失效'},
  ACCESS_TOKEN_AUTHENTICATE_FAILED: {code: 1007, desc: 'TOKEN认证失败'},

  AUTH_CODE_ERROR: {code: 1008, desc: '验证码不一致'},
  AUTH_CODE_TIMEOUT: {code: 1009, desc: '验证码已超时'},
  AUTH_CODE_TODAY_UPPER_LIMIT: {code: 1010, desc: '当日短信发送已达到上限'},


  USER_NOT_LOGIN: {code: 2000, desc: '未登录'},
  USER_NOT_EXIST: {code: 2001, desc: '用户不存在'},
  USER_ALREADY_EXIST: {code: 2002, desc: '用户已存在'},

  MOBILE_ALREADY_EXIST: {code: 2003, desc: '手机号码已被占用'},
  EMAIL_ALREADY_EXIST: {code: 2004, desc: '邮箱地址已被占用'},
  MOBILE_AVALIABLE: {code: 2005, desc: '手机号码可用'},
  EMAIL_AVALIABLE: {code: 2006, desc: '邮箱地址可用'},

  MOBILE_FORMAT_ERROR: {code: 2007, desc: '手机号码格式错误'},
  EMAIL_FORMAT_ERROR: {code: 2008, desc: '邮箱地址格式错误'},

  USER_OR_PASSWORD_WRONG: {code: 2009, desc: '账号或密码错误'},
  ALREADY_FOLLOWED: {code: 2010, desc: '已关注该用户'},
  NO_FOLLOW_THIS_USER: {code: 2011, desc: '没有关注该用户'},

  ACTIVITY_NOT_EXIST: {code: 3001, desc: '活动不存在'},
  ACTIVITY_GROUP_NOT_EXIST: {code: 3002, desc: '活动分组不存在'},
  ACTIVITY_GROUP_ALREADY_JOINED: {code: 3003, desc: '已加入该活动分组'},
  ACTIVITY_GROUP_ALREADY_QUIT: {code: 3004, desc: '已退出该活动分组'},
  ACTIVITY_GROUP_ALREADY_DEADLINE: {code: 3005, desc: '活动报名已结束'},
  ACTIVITY_GROUP_JOIN_NOT_STARTED: {code: 3006, desc: '活动未开始报名'},
  ACTIVITY_GROUP_SIGN_UP_FULL: {code: 3007, desc: '活动分组报名已满'},
  ACTIVITY_GROUP_SIGN_UP_CLOSE: {code: 3008, desc: '分组报名结束'},
  ACTIVITY_HAVA_NOT_CAPTAIN_PERMISSION: {code: 3009, desc: '没有领队权限'},


  ORGANIZER_NOT_EXIST: {code: 3010, desc: '组织单位不存在'},

  TEAM_NOT_EXIST: {code: 4001, desc: '队部不存在'},

  OFFICIAL_ACTION_NOT_EXIST: {code: 5001, desc: '官方动态不存在'},
  RECRUIT_GROUP_NOT_EXIST: {code: 5002, desc: '招募分组不存在'},
  RECRUIT_GROUP_ALREADY_JOINED: {code: 5003, desc: '已加入该招募分组'},
  RECRUIT_GROUP_ALREADY_QUIT: {code: 5004, desc: '已退出该招募分组'},
  RECRUIT_GROUP_ALREADY_DEADLINE: {code: 5005, desc: '招募报名已结束'},
  RECRUIT_GROUP_JOIN_NOT_STARTED: {code: 5006, desc: '招募未开始报名'},
  RECRUIT_GROUP_SIGN_UP_FULL: {code: 5007, desc: '招募分组报名已满'},
  RECRUIT_GROUP_SIGN_UP_CLOSE: {code: 5008, desc: '分组报名结束'},

  EVENT_REQUIRED_ERROR: {code: 6001, desc: '请选择运动项目'},

  HOT_NOT_EXIST: {code: 7001, desc: '热门推荐不存在'},

  NOTIFICATION_NOT_EXIST: {code: 8001, desc: '消息提醒不存在'},

};

module.exports = ErrorCode;
