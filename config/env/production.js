'use strict';

module.exports = {
  secret: '123together',
  db: 'mongodb://teamun:duibu2015@dds-bp1f78ff40e23c041.mongodb.rds.aliyuncs.com:3717,dds-bp1f78ff40e23c042.mongodb.rds.aliyuncs.com:3717/teamun',
  port: 3002,
  app: {
    title: 'teamun-api',
    description: 'teamun server side RESTFul API',
    keywords: 'team, game, 1 2 3 together, all in, go big or go home',
    restApiRoot: '/api'
  },
  qiniu: {
    accessKey: 'AnDmzQ2mVqXUfRzOlDV2ayBjtyqxWZl7mVttEl9w',
    secretKey: 'V-56sc2R7Pm9WAxC45WlQdqrPkqBrNyonbD6hObl',
    bucket: 'teamun',
    domain: 'http://7xkwk0.com2.z0.glb.qiniucdn.com'
  },
  alidayu: {
    appkey: '23261229',
    appsecret: '22ac429268dd97245b948abe2441ed59',
    REST_URL: 'http://gw.api.taobao.com/router/rest'
  }
};
