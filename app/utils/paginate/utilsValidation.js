'use strict';

exports.assertValidRange = function (range) {

  var state = {
    isValid: true
  };

  if (/^[0-9]{1,6}-[0-9]{1,6}$/.test(range) === false) {
    state.isValid = false;
  }

  var parts = range.split('-');

  if ((parseInt(parts[0], 10) < parseInt([parts[1]], 10)) === false) {
    state.isValid = false;
  }
  else {
    state.rangeFrom = parseInt(parts[0], 10);
    state.rangeTo = parseInt([parts[1]], 10);
  }

  return state;

};


exports.getRange = function (page) {
  return (page * 10) + '-' + ((parseInt(page) + 1) * 10 - 1);
};