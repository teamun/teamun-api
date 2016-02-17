'use strict';
var crypto = require('crypto'),
  util = require('util');

var safeEncode = function(str) {
  var encoded = new Buffer(str).toString('base64');
  var rtn = encoded.replace(/\//g, '_').replace(/\+/g, '-');

  return rtn;
};

var encodeSign = function(str, key) {
  return safeEncode(
    crypto
      .createHmac('sha1', key)
      .update(str)
      .digest()
  );
};

exports.safeEncode = function(str) {
  var encoded = new Buffer(str).toString('base64');
  var rtn = encoded.replace(/\//g, '_').replace(/\+/g, '-');

  return rtn;
};

exports.accessToken = function(path, body, secretKey, accessKey) {
  body = body || '';

  var data = util.format('%s\n%s', path, body);

  var encodeSignData = encodeSign(data, secretKey);

  return util.format('QBox %s:%s', accessKey, encodeSignData);
};