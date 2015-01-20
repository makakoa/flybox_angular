'use strict';

var nodemailer = require('nodemailer');

module.exports = function(smtpInfo, mailOptions, logging) {
  if (logging) console.log('fly[]: sending "' + mailOptions.subject + '" from ' + smtpInfo.auth.user);
  var transporter = nodemailer.createTransport(smtpInfo);
  transporter.sendMail(mailOptions, function(err, res) {
    if (err) {
      return console.log(err);
    }
    if (logging) console.log('fly[]: Message sent: ' + res.message);
  });
};
