// Should cover to address being user/not, and whether to send link/text
// ntfcs = notifications
//Takes formatted smtp and a mail object with properties (from, name, to, subject, text)
'use strict';

var mailer = require('./mailer');

module.exports = function(smtp, mail, logging, callback) {
  if (logging) console.log('fly[m]: Constructing Mail: ' + mail.subject);
  var ntfcs = [];
  var norms = [];
  var links = [];
  var email = {
    from: mail.name + '<' + mail.from + '>'
  };

  var isEmail = function(address) {
    var at = address.indexOf('@');
    var dot = address.lastIndexOf('.');
    return !(at < 1 || dot < at + 2 || dot + 2 >= address.length);
  };

  var sendNtfc = function() {
    if (ntfcs.length > 0) {
      if (logging) console.log('fly[m]: Sending out notifications for ' + mail.subject);
      email.to = ntfcs;
      email.subject = 'New Flybox Messages: ' + mail.subject;
      email.text = 'You have new Flybox messages from ' + mail.name + ' in ' + mail.subject;
      mailer(smtp, email, logging, function() {return;});
      setTimeout(sendNorm(), 5000);
    } else {
      sendNorm();
    }
  };

  var sendNorm = function() {
    if (norms.length > 0) {
      if (logging) console.log('fly[m]: Sending out emails for ' + mail.subject);
      email.to = norms;
      email.subject = mail.subject;
      email.text = mail.text;
      email.html = mail.html;
      mailer(smtp, email, logging, callback);
      setTimeout(sendLink(0), 5000);
    } else {
      sendLink(0);
    }
  };

  var sendLink = function(num) {
    if (num >= links.length) return;
    if (logging) console.log('fly[m]: Sending out links for ' + mail.subject);
    email.to = links;
    email.subject = 'New Flybox Messages: ' + mail.subject;
    email.text = 'You have new Flybox messages from ' + mail.name + ' in ' + mail.subject + '.\n To view them go here...';
    setTimeout(sendLink(++num), 5000);
  };

  mail.to.forEach(function(member) {
    if (!isEmail(member.email)) return;
    if (member.isUser) {
      ntfcs.push(member.email);
    } else if (member.link) {
      links.push({
        at: member.email,
        key: member.guestKey
      });
    } else {
      norms.push(member.email);
    }
  });

  sendNtfc();
};
