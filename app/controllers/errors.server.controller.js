'use strict';

/**
 * 截取错误名
 */
var getUniqueErrorMessage = function(err) {
  var output;

  try {
    var fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
    output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' 已存在';

  } catch (ex) {
    output = '唯一字段已存在';
  }

  return output;
};

/**
 * 封装错误信息
 */
exports.getErrorMessage = function(err) {
  var message = '';
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = getUniqueErrorMessage(err);
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    if(err.errors) {
      for (var errName in err.errors) {
        if (err.errors[errName].message) {
          message = err.errors[errName].message;
        }
      }
    } else {
      message = err;
    }
  }
  return message;
};
