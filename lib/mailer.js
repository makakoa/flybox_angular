'use strict';

var nodemailer = require('nodemailer');

module.exports = function(mailOptions, smtpInfo) {  
  console.log('sending ' + mailOptions.subject + ' from ' + smtpInfo.auth.user);
  var transport = nodemailer.createTransport(smtpInfo);
  transport.sendMail(mailOptions, function(err, res) {
    if (err) {
      return console.log(err);
    }
    console.log('Message sent: ' + res.message);
  });
  transport.close();
};
