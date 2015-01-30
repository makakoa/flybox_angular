'use strict';

var nodemailer = require('nodemailer');

module.exports = function(smtpInfo, mailOptions, logging, callback) {
  if (logging) console.log('fly[m]: sending "' + mailOptions.subject + '" from ' + smtpInfo.auth.user);
  var transporter = nodemailer.createTransport(smtpInfo);
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) return console.log(err);
    if (logging) console.log('fly[m]: Message sent: ' + info.messageId);
    callback(info.messageId);
  });
};
