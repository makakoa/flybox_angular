'use strict';

module.exports = function() {
  return Math.random().toString(36).split('').filter(function(value, index, self) {
    return self.indexOf(value) === index;
  }).join('').substr(2, 8);
};
