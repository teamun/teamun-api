'use strict';

module.exports = {
  app: {
    title: 'teamun-api',
    description: 'teamun server side RESTFul API',
    keywords: 'team, game, 1 2 3 together, all in, go big or go home',
    restApiRoot: '/api'
  },
  qiniu: {
    accessKey: 'NxJbWzoVCPg3q4Vm_FczeqcclfwDTer36GhaFe11',
    secretKey: 'IduveqU7oa1y3YQeiZf5pZ_t9gGm3OqHOolDRygK',
    bucket: 'hoops',
    domain: 'http://hoops.qiniudn.com'
  },
  alidayu: {
    appkey: '23261229',
    appsecret: '22ac429268dd97245b948abe2441ed59',
    REST_URL: 'http://gw.api.taobao.com/router/rest'
  },
  port: process.env.PORT || 3000,
  sessionSecret: 'MEAN',
  sessionCollection: 'sessions'
};
