'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('./errors.server.controller.js'),
  mongoose = require('mongoose'),
  fs = require('fs'),
  qn = require('qn'),
  qiniu = require('qiniu'),
  Q = require('q'),
  ErrorCode = require('../utils/enum/errorCode.js'),
  FormValidation = require('../utils/common/formValidation.js'),
  config = require('../../config/config');

var client = qn.create({
  accessKey: config.qiniu.accessKey,
  secretKey: config.qiniu.secretKey,
  bucket: config.qiniu.bucket,
  domain: config.qiniu.domain,
  // timeout: 3600000, // default rpc timeout: one hour, optional
  // if your app outside of China, please set `uploadURL` to `http://up.qiniug.com/`
  // uploadURL: 'http://up.qiniu.com/',
});


exports.upload = function(req, res) {
  var file = req.files.file;
  // console.log(file.name);
  // console.log(file.type);
  // console.log(file.path);

  client.upload(fs.createReadStream(file.path), function(err, result) {
    if (err) {
      return res.json({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        success: true,
        imgurl: result.url
      });
    }
  });
};


exports.uptoken = function(req, res) {
  qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
  qiniu.conf.SECRET_KEY = config.qiniu.secretKey;
  var putPolicy = new qiniu.rs.PutPolicy('teamun');
  //putPolicy.callbackUrl = callbackUrl;
  //putPolicy.callbackBody = callbackBody;
  //putPolicy.returnUrl = returnUrl;
  //putPolicy.returnBody = returnBody;
  //putPolicy.asyncOps = asyncOps;
  //putPolicy.expires = expires;
  return res.json({
    ret: 1,
    msg: ErrorCode.SUCCESS.desc,
    data: putPolicy.token()
  });
}


exports.checkAvailableMobile = function(req, res, next) {
  return FormValidation.checkAvailableMobile(req, res, req.body.mobile);
};


exports.checkAvailableEmail = function(req, res, next) {
  return FormValidation.checkAvailableEmail(req, res, req.body.email);
};


// var promisedStep1 = function () {
//   return "1";
// }

// var promisedStep2 = function (param1) {
//   return param1;
// }

// var promisedStep3 = function (param2) {
//   var array = [1,2];
//   console.log(array[3]);
//   return param2;
// }
// exports.promisetest = function(req, res) {

//   Q.fcall(promisedStep1)
//     .then(promisedStep2(promisedStep1))
//     .then(promisedStep3(promisedStep2))
//     .then(function(value4) {
//       res.json({
//         success: true,
//         result: value4
//       });
//     })
//     .catch(function(error) {
//       console.log('catch');
//     })
//     .done();
// };
