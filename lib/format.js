// should have smtp formatter and imap formatter
'use strict';

exports.smtp = function(account) {
  var smtp = {
    auth: {
      user: account.email,
      pass: account.password
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
    password: account.password
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
