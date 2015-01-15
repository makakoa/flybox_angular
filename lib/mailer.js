'use strict';

var nodemailer = require('nodemailer');
//var transport = require('nodemailer-smtp-transport');

module.exports = function(mailOptions, smtpInfo) {
  console.log('sending "' + mailOptions.subject + '" from ' + smtpInfo.auth.user);
  //smtpInfo.greetingTimeout = 10000;
  var transporter = nodemailer.createTransport(smtpInfo);
  transporter.sendMail(mailOptions, function(err, res) {
    if (err) {
      return console.log(err);
    }
    console.log('Message sent: ' + res.message);
  });
};
