// Should cover to address being user/not, and whether to send link/text
// ntfcs = notifications
'use strict';

var User = require('../models/user');
var mailer = require('./mailer');

module.exports = function(smtp, mail, logging) {
  if (logging) console.log('fly[]: Constructing Mail: ' + mail.subject);
  var ntfcs = [];
  var norms = [];
  //var links = [];
  var email = {
    from: mail.name + '<' + mail.from + '>'
  };

  var isEmail = function(address) {
    var at = address.indexOf('@');
    var dot = address.lastIndexOf('.');
    return !(at < 1 || dot < at + 2 || dot + 2 >= address.length);
  };

  var ready;
  var readyCheck = function() {
    ready++;
    if (ready >= mail.to.length) sendNtfc();
  }; //not working, use async?

  mail.to.forEach(function(address) {
    if (!isEmail(address)) return readyCheck();
    User.findOne({accounts: {$elemMatch: {email: address}}}, function(err, user) {
      if (err) console.log(err);
      console.log(user);
      if (user) {
        ntfcs.push(address);
      } else {
        norms.push(address);
      }
      readyCheck();
    });
  });

  var sendNtfc = function() {
    if (ntfcs.length > 0) {
      if (logging) console.log('fly[]: Sending out notifications for ' + mail.subject);
      email.to = ntfcs;
      email.subject = 'New Flybox Messages: ' + mail.subject;
      email.text = 'You have new Flybox messages from ' + mail.name + ' in ' + mail.subject;
      mailer(smtp, email, logging);
      setTimeout(sendNorm(), 5000);
    } else {
      sendNorm();
    }
  };
  var sendNorm = function() {
    if (norms.length > 0) {
      if (logging) console.log('fly[]: Sending out emails for ' + mail.subject);
      email.to = norms;
      email.subject = mail.subject;
      email.text = mail.text;
      mailer(smtp, email, logging);
    }
  };

};
