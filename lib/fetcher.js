'use strict';

var Imap = require('imap');
var MailParser = require('mailparser').MailParser;

/*
var exampleImapInfo = {
  user: 'flybox4real@gmail.com',
  password: 'flyboxme',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
};
*/

exports.getInbox = function(imapInfo, callback) {
  var imap = new Imap(imapInfo);
  var inbox = [];

  imap.once('ready', function() {
    imap.openBox('INBOX', true, function(err, box) {
      if (err) throw err;
      var f = imap.seq.fetch(box.messages.total + ':' + (box.messages.total - 9), {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'
      });
      f.on('message', function(msg, seqno) {
        var parser = new MailParser();
        parser.on('end', function(mail) {
          mail.headers.number = seqno;
          inbox.push(mail.headers);
        });
        msg.on('body', function(stream) {
          var buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', function() {
            parser.write(buffer.toString());
          });
        });
        msg.once('end', function() {
          console.log('Message ' + seqno + ' Finished');
          parser.end();
        });
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });

  imap.once('error', function(err) {
    console.log(err);
  });

  imap.once('end', function() {
    console.log('Connection ended');
    callback(inbox);
  });

  imap.connect();
};

exports.getEmail = function(imapInfo, email, callback) {
  var imap = new Imap(imapInfo);
  var response;

  imap.once('ready', function() {
    imap.openBox('INBOX', true, function(err) {
      if (err) throw err;
      var f = imap.seq.fetch(email.number + ':*', {
        bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
        struct: true
      });
      f.on('message', function(msg, seqno) {
        var parser = new MailParser();
        var body = '';
        var headers = '';
        parser.on('end', function(mail) {
          response = mail;
        });
        msg.on('body', function(stream, info) {
          var buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', function() {
            if (info.which == 'TEXT') {
              body += buffer;
            } else {
              headers += buffer;
            }
          });
        });
        msg.once('end', function() {
          console.log('Message ' + seqno + ' Finished');
          parser.write(headers);
          parser.write(body);
          parser.end();
        });
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });

  imap.once('error', function(err) {
    console.log(err);
  });

  imap.once('end', function() {
    console.log('Connection ended');
    callback(response);
  });

  imap.connect();
};

/*var num = {
  number: 87
};
exports.getEmail(exampleImapInfo, num, function(email) {
  console.log(email);
});*/
