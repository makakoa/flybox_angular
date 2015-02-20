'use strict';

var Box = require('../models/box');
var Post = require('../models/post');
var genKey = require('../lib/key_gen');
var mailFactory = require('../lib/mailFactory');
var fetcher = require('../lib/fetcher');
var format = require('../lib/format');

module.exports = function(app, jwtAuth, logging) {
  // get single box
  app.get('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    var user = getCurrent(req.user);
    if (logging) console.log('fly[b]: Getting box ' + req.params.boxKey + ' for ' + req.user.email + ' as ' + user);
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {email: user}}})
    .populate('thread')
    .exec(function(err, data) {
      if (err) handle(err, res);
      var response = {
        box: data,
        user: {name: user}
      };
      res.json(response);
    });
  });

  // get guest box
  app.get('/api/box/guest/:boxKey/:guestKey', function(req, res) {
    if (logging) console.log('fly[b]: Getting box ' + req.params.boxKey + ' for guest: ' + req.params.guestKey);
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {guestKey: req.params.guestKey}}})
    .populate('thread')
    .exec(function(err, data) {
      if (err) handle(err, res);
      var guest = {};
      data.members.forEach(function(member) {
        if (member.guestKey == req.params.guestKey) {
          guest = member;
        }
      });
      var response = {
        box: data,
        user: {name: guest.email}
      };
      res.json(response);
    });
  });

  // add member to box
  app.post('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    if (logging) console.log('fly[b]: Adding ' + req.body.email + ' to ' + req.params.boxKey);
    var user = getCurrent(req.user);
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {email: user}}}, function(err, box) {
      if (err) handle(err, res);
      box.members.push({
        email: req.body.email,
        unread: 1
      });
      box.save(function(err) {
        if (err) handle(err, res);
        res.json({msg: 'member added'});
      });
    });
  });

  // leave box
  app.delete('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    var user = getCurrent(req.user);
    if (logging) console.log('fly[b]: ' + user + ' leaving ' + req.params.boxKey);
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {email: user}}}, function(err, box) {
      if (err) handle(err, res);
      box.members.forEach(function(member) {
        if (member.email === user) {
          member.remove();
        }
      });
      box.save(function(err) {
        if (err) handle(err, res);
        res.json({msg: 'left box'});
      });
    });
  });

  // search boxes
  app.get('/api/boxes/search/:keywords', jwtAuth, function(req, res) {
    var user = getCurrent(req.user);
    if (logging) console.log('fly[b]: Getting inbox for ' + req.user.email + ' as ' + user);
    var boxes = [];
    Box.find({members: {$elemMatch: {email: user}}}, function(err, data) {
      if (err) handle(err, res);
      data.forEach(function(box) {
        var num;
        box.members.forEach(function(member) {
          if (user === member.email) {
            num = member.unread;
            return;
          }
        });
        boxes.push({
          email: box.members[0].email,
          subject: box.subject,
          date: box.date,
          boxKey: box.boxKey,
          unread: num,
          isBox: true
        });
      });
      var accounts = [];
      for (var i = 0; i < req.user.accounts.length; i++) {
        accounts.push({
          name: req.user.accounts[i].email,
          number: i
        });
      }
      var response = {
        user: {name: user, current: req.user.current, email: req.user.email},
        current: user,
        accounts: accounts,
        inbox: boxes
      };
      res.json(response);
    });
  });

  // get inbox
  app.get('/api/boxes', jwtAuth, function(req, res) {
    var user = getCurrent(req.user);
    if (logging) console.log('fly[b]: Getting inbox for ' + req.user.email + ' as ' + user);
    var boxes = [];
    Box.find({members: {$elemMatch: {email: user}}}, function(err, data) {
      if (err) handle(err, res);
      data.forEach(function(box) {
        var num;
        box.members.forEach(function(member) {
          if (user === member.email) {
            num = member.unread;
            return;
          }
        });
        boxes.push({
          email: box.members[0].email,
          subject: box.subject,
          date: box.date,
          boxKey: box.boxKey,
          unread: num,
          isBox: true
        });
      });
      var accounts = [];
      for (var i = 0; i < req.user.accounts.length; i++) {
        accounts.push({
          name: req.user.accounts[i].email,
          number: i
        });
      }
      var response = {
        user: {name: user, current: req.user.current, email: req.user.email},
        current: user,
        accounts: accounts,
        inbox: boxes
      };
      res.json(response);
    });
  });

  // send box
  app.post('/api/boxes', jwtAuth, function(req, res) {
    var user = getCurrent(req.user);
    if (logging) console.log('fly[b]: Posting box for ' + req.user.email + ' as ' + user);
    var post = new Post();
    post.content = req.body.post.text;
    post.html = req.body.post.html;
    post.by = user;
    post.save(function(err) {
      if (err) handle(err, res);
    });
    var box = new Box();
    try {
      box.subject = req.body.subject;
      box.boxKey = genKey();
      box.members = [{email: user, name: req.user.displayName, unread: 0, isUser: true}];
      req.body.members.forEach(function(member) {
        if (!member.isUser && member.link) member.guestKey = genKey();
        member.unread = 1;
        box.members.push(member); //should add format check or error catch
      });
      box.thread = [post._id];
    } catch (err) {
      handle(err, res);
    }
    box.save(function(err) {
      if (err) handle(err, res);
      if (req.body.sendEmail) {
        if (logging) console.log('fly[b]: Box posted, mailing box as ' + user);
        var smtp = format.smtp(req.user.accounts[req.user.current]);
        var mail = {
          from: user,
          name: req.user.displayName,
          to: req.body.members,
          subject: box.subject,
          text: post.content,
          html: post.html
        };
        mailFactory(smtp, mail, logging, function(messageId) {
          box.originalMessageId = messageId;
          box.save();
        });
      }
      res.json({msg: 'sent!'});
    });
  });

  // Sync emails
  app.post('/api/emails/import', jwtAuth, function(req, res) {
    var user = getCurrent(req.user);
    if (logging) console.log('fly[b]: Importing emails for ' + req.user.email + ' from ' + user);
    var last = req.user.accounts[req.body.index].lastImported;
    var imap = format.imap(req.user.accounts[req.body.index]);
    fetcher.getMail(last, imap, logging, function(inbox) {
      if (logging) console.log('fly[b]: Posting boxes... (C: Creating box, A: Adding to existing box)');
      var saveEmail = function(num) {
        if (num == inbox.length) return console.log(' Finished posting');
        var mail = inbox[num];
        req.user.accounts[req.body.index].lastImported = inbox[num].number;
        req.user.save();
        if (mail.subject) {
          if (mail.subject.indexOf('Re: ') === 0) mail.subject = mail.subject.substring(4);
          if (mail.subject.indexOf('Fwd: ') === 0) mail.subject = mail.subject.substring(5);
          if (mail.subject.indexOf('New Flybox Messages:') === 0) return saveEmail(++num);
        }
        var post = new Post();
        post.content = mail.text;
        post.html = mail.html;
        post.by = mail.from[0].address;
        post.date = mail.date;
        post.save(function(err) {
          if (err) handle(err, res);
        });
        var original = mail.messageId;
        if (mail.references) original = mail.references[0];
        Box.findOne({subject: mail.subject, originalMessageId: original}, function(err, box) {
          if (err) handle(err, res);
          if (box) {
            if (logging) process.stdout.write('A');
            box.thread.push(post._id);
            box.save(function(err) {
              if (err) handle(err, res);
            });
            saveEmail(++num);
          } else {
            if (logging) process.stdout.write('C');
            var newBox = new Box();
            try {
              newBox.subject = mail.subject;
              newBox.boxKey = genKey();
              newBox.members = [{email: mail.from[0].address, unread: 0}, {email: mail.to[0].address, unread: 0}];
              newBox.thread = [post._id];
              newBox.date = mail.date;
              newBox.originalMessageId = original;
            } catch (err) {
              handle(err, res);
            }
            newBox.save(function(err) {
              if (err) handle(err, res);
              saveEmail(++num);
            });
          }
        });
      };
      saveEmail(0);
      if (logging) console.log('fly[b]: Finished import');
      res.json({msg: 'emails imported'});
    });
  });

  var handle = function(err, res) {
    console.log(err);
    return res.status(500).send('Box Error');
  };

  var getCurrent = function(user) {
    var currently = user.email;
    if (user.accounts.length > 0 && !isNaN(user.current)) currently = user.accounts[user.current].email;
    return currently;
  };
};
