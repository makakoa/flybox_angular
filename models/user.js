'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');

var userSchema = mongoose.Schema({
  email: String,
  password: String,
  displayName: String,
  current: Number,
  accounts: [{
    email: String,
    password: String,
    service: String,
    lastImported: Number,
    smtp: {},
    imap: {}
  }]
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateToken = function(secret) {
  var _this = this;
  var token = jwt.encode({
    iss: _this._id
  }, secret);
  return token;
};

module.exports = mongoose.model('User', userSchema);
