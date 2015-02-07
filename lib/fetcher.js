'use strict';

var Imap = require('imap');
var MailParser = require('mailparser').MailParser;

exports.getMail = function(from, imapInfo, logging, callback) {
  if (logging) process.stdout.write('fly[i]: Syncing inbox...');
  var imap = new Imap(imapInfo);
  var inbox = [];

  imap.once('ready', function() {
    imap.openBox('INBOX', true, function(err, box) {
      if (err) throw err;
      if (box.messages.total == from) return imap.end();
      if (from == -1) from = Math.max(box.messages.total - 200, 1);
      var f = imap.seq.fetch(box.messages.total + ':' + from, { //Math.max(box.messages.total - 999, 1)
        bodies: '',
        struct: true
      });
      if (logging) process.stdout.write('fetching... ');
      f.on('message', function(msg, seqno) {
        var parser = new MailParser({
          debug: false,
          streamAttachments: true,
          unescapeSMTP: false,
          showAttachmentLinks: true
        });
        parser.on('end', function(mail) {
          mail.number = seqno;
          inbox.push(mail);
        });
        msg.on('body', function(stream) {
          var buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString();
          });
          stream.once('end', function() {
            parser.write(buffer);
          });
        });
        msg.once('end', function() {
          if (logging) process.stdout.write(seqno + ' ');
          parser.end();
        });
      });
      f.once('error', function(err) {
        console.log('Fetch error: ' + err);
      });
      f.once('end', function() {
        if (logging) process.stdout.write('done ');
        imap.end();
      });
    });
  });

  imap.once('error', function(err) {
    console.log(err);
  });

  imap.once('end', function() {
    if (logging) console.log(' ...disconnected');
    callback(inbox);
  });

  imap.connect();
};

//use for email search
exports.searchEmail = function(imapInfo, email, callback) {
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
