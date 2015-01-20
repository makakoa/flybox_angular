// Should cover to member being user/not, and whether to send link/text
// ntfcs = notifications
'use strict';

var User = require('../models/user');

module.exports = function(smtp, mail) {
  var ntfcs = [];
  var norms = [];
  //var links = [];
  mail.members.forEach(function(member) {
    User.findOne({accounts: {$elemMatch: {username: member.email}}}, function(err, user) {
      if (err) console.log(err);
      if (user) {
        ntfcs.push(member);
      } else {
        norms.push(member);
      }
    });
  });
};
