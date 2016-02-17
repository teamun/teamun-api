'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
  config = require('./config/config'),
  mongoose = require('mongoose'),
  chalk = require('chalk');

/**
 * 项目入口主配置文件
 * 注意加载顺序很重要
 */

// mongodb 连接
var db = mongoose.connect(config.db, function(err) {
  if (err) {
    console.error(chalk.red('Could not connect to MongoDB!'));
    console.log(chalk.red(err));
  }
});

// 初始化 express 配置
var app = require('./config/express')(db);

// 引入 passport 配置
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);
