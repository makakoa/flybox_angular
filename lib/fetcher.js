'use strict';

var Imap = require('imap');
var MailParser = require('mailparser').MailParser;

/*var exampleImapInfo = {
  user: 'flybox4real@gmail.com',
  password: 'flyboxme',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
};*/

exports.getInbox = function(imapInfo, callback) {
  var imap = new Imap(imapInfo);
  var inbox = [];

  var openInbox = function(cb) {
    imap.openBox('INBOX', true, cb);
  };

  imap.once('ready', function() {
    openInbox(function(err, box) {
      if (box);
      if (err) throw err;
      var f = imap.seq.fetch(box.messages.total + ':' + (box.messages.total - 9), {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)'
      });
      f.on('message', function(msg, seqno) {
        var parser = new MailParser();
        parser.on('end', function(mail) {
          inbox.push(mail.headers);
        });
        //console.log('Message #%d', seqno);
        var prefix = '(#' + seqno + ') ';
        msg.on('body', function(stream, info) {
          if (info);
          //if (info.which === 'TEXT')
            //console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
          var buffer = '';
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
            //if (info.which === 'TEXT')
              //console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
          });
          stream.once('end', function() {
            //if (info.which !== 'TEXT')
              //console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
            //else
              //console.log(prefix + 'Body [%s] Finished', inspect(info.which));
            parser.write(buffer.toString());
          });
        });
        msg.once('attributes', function(attrs) {
          if (attrs);
          //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
        });
        msg.once('end', function() {
          console.log(prefix + 'Finished');
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

/*exports.getInbox(exampleImapInfo, function(inbox) {
  console.log(inbox);
});*/

exports.getEmail = function(imapInfo, email, callback) {
  if (imapInfo || email || callback);
  var imap = new Imap(imapInfo);
  var response;

  var openInbox = function(cb) {
    imap.openBox('INBOX', true, cb);
  };

  imap.once('ready', function() {
    openInbox(function(err, box) {
      if (box);
      if (err) throw err;
      var f = imap.seq.fetch(email.number + ':*', {
        bodies: ['HEADER.FIELDS (FROM)', 'TEXT'],
        struct: true
      });
      f.on('message', function(msg, seqno) {
        //console.log('Message #%d', seqno);
        var prefix = '(#' + seqno + ') ';
        var body = '';
        msg.on('body', function(stream, info) {
          if (info);
          //if (info.which === 'TEXT')
            //console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
          var buffer = '';
          var count = 0;
          stream.on('data', function(chunk) {
            count += chunk.length;
            buffer += chunk.toString('utf8');
            //if (info.which === 'TEXT')
              //console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
          });
          stream.once('end', function() {
            //if (info.which !== 'TEXT')
              //console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
            //else
              //console.log(prefix + 'Body [%s] Finished', inspect(info.which));
            console.log('&&&&&Buffer here: ' + buffer.toString());
            body += buffer.toString();
          });
        });
        msg.once('attributes', function(attrs) {
          if (attrs);
          //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
        });
        msg.once('end', function() {
          response.body = body;
          console.log(prefix + 'Finished');
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
