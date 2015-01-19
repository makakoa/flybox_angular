'use strict';

var jwt = require('jwt-simple');
var secret = process.env.ASECRET || 'changethis'; // app.set?

exports.smtp = function(account) {
  var smtp = {
    auth: {
      user: account.email,
      pass: jwt.decode(account.password, secret)
    }
  };
  if (account.service) {
    smtp.service = account.service;
  } else {
    smtp.host = account.smtp.host;
    smtp.port = account.smtp.port;
    smtp.secureConnection = account.smtp.secure;
  }
  return smtp;
};

exports.imap = function(account) {
  var imap = {
    user: account.email,
    password: jwt.decode(account.password, secret)
  };
  if (account.service == 'gmail') {  // add switch for future services
    imap.host = 'imap.gmail.com';
    imap.port = 993;
    imap.tls = true;
  } else {
    imap.host = account.imap.host;
    imap.port = account.imap.port;
    imap.tls = account.imap.tls;
  }
  return imap;
};
