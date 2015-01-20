'use strict';

var jwt = require('jwt-simple');
var User = require('../models/user');

module.exports = function(secret) {
  return function(token, callback) {
    var decoded;
    try {
      decoded = jwt.decode(token, secret);
    } catch (err) {
      console.log(err);
    }
    User.findOne({_id: decoded.iss}, function(err, user) {
      if (err) return console.log(err);
      return callback(user);
    });
  };
};
