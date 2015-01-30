'use strict';

var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

module.exports = function(passport) {
  passport.use('basic', new BasicStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({email: email}, function(err, user) {
      if (err) return done('fly[p]: server error');
      if (!user) return done('fly[p]: access error');
      if (!user.validPassword(password)) return done('fly[p]: access error');
      return done(null, user);
    });
  }));
};
