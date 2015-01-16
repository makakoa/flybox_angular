'use strict';

var fillerImap = {
  user: 'flybox4real@gmail.com',
  password: 'flyboxme',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
};

var Box = require('../models/box');
var Post = require('../models/post');
var key = require('../lib/key_gen');
var mailer = require('../lib/mailer');
var fetcher = require('../lib/fetcher');

module.exports = function(app, jwtAuth) {
  // get single box
  app.get('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    console.log('Getting box ' + req.params.boxKey + ' for ' + req.params.email);
    var as = req.user.email;
    if (req.user.smtps.length > 0) as = req.user.smtps[req.user.current].auth.user;
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {email: as}}})
    .populate('thread')
    .exec(function(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve box');
      }
      var response = {
        box: data,
        name: req.user.email
      };
      res.json(response);
    });
  });

  // add member to box
  app.post('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {email: req.user.email}}}, function(err, box) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve box');
      }
      box.members.push({
        email: req.body.email,
        unread: 1
      });
      box.save(function(err) {
        if (err) {
          console.log(err);
          return res.status(500).send('there was an error');
        }
        res.json({msg: 'member added'});
      });
    });
  });

  // leave box
  app.delete('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {email: req.user.email}}}, function(err, box) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve box');
      }
      box.members.forEach(function(member) {
        if (member.email === req.user.email) {
          member.remove();
        }
      });
      box.save(function(err) {
        if (err) {
          console.log(err);
          return res.status(500).send('there was an error');
        }
        res.json({msg: 'left box'});
      });
    });
  });

  // get inbox
  app.get('/api/boxes', jwtAuth, function(req, res) {
    console.log('getting inbox for ' + req.user.email);
    var boxes = [];
    var as = req.user.email;
    if (req.user.smtps.length > 0) as = req.user.smtps[req.user.current].auth.user;
    Box.find({members: {$elemMatch: {email: as}}}, function(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve boxes');
      }
      data.forEach(function(box) {
        var num;
        box.members.forEach(function(member) {
          if (req.user.email === member.email) {
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
      for (var i = 0; i < req.user.smtps.length; i++) {
        accounts.push({
          name: req.user.smtps[i].auth.user,
          number: i
        });
      }
      var response = {
        name: req.user.email,
        current: as,
        accounts: accounts,
        inbox: boxes
      };
      res.json(response);
    });
  });

  //send box
  app.post('/api/boxes', jwtAuth, function(req, res) {
    console.log('post route hit');
    var as = req.user.email;
    if (req.user.smtps.length > 0) as = req.user.smtps[req.user.current].auth.user;
    var post = new Post();
    post.content = req.body.post;
    post.by = as;
    post.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
    });
    var box = new Box();
    try {
      box.subject = req.body.subject;
      box.boxKey = key();
      box.members = [{email: as, unread: 0}];
      req.body.members.forEach(function(member) {
        box.members.push({email: member, unread: 1});
      });
      box.thread = [post._id];
    } catch (err) {
      return res.status(400).send('invalid input');
    }
    box.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      console.log('box posted');
      //add checker for flybox user here
      var mailOptions = {
        from: req.user.displayName + '<' + req.user.email + '>',
        to: req.body.members,
        subject: box.subject,
        text: post.content
      };
      var smtpOptions = {
        service: 'gmail',
        auth: {
          user: 'flybox4real@gmail.com',
          pass: 'flyboxme'
        }
      };
      mailer(mailOptions, smtpOptions);

      res.json({msg: 'sent!'});
    });
  });

  // import emails
  app.get('/api/emails/import', jwtAuth, function(req, res) {
    fetcher.getMail(fillerImap, function(inbox) {
      inbox.forEach(function(mail) {
        console.log(mail);
        var post = new Post();
        post.content = mail.text;
        post.by = mail.from[0].address;
        post.date = mail.date;
        post.save(function(err) {
          if (err) {
            console.log(err);
            return res.status(500).send('there was an error');
          }
        });
        var box = new Box();
        try {
          box.subject = mail.subject;
          box.boxKey = key();
          box.members = [{email: mail.from[0].address, unread: 0}, {email: mail.to[0].address, unread: 0}];
          box.thread = [post._id];
        } catch (err) {
          return res.status(400).send('invalid input');
        }
        box.save(function(err) {
          if (err) {
            console.log(err);
            return res.status(500).send('there was an error');
          }
          console.log('box posted to ' + mail.to[0].address);
        });
      });
    });
  });
};
