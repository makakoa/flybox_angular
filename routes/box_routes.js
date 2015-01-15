'use strict';

var Box = require('../models/box');
var Post = require('../models/post');
var key = require('../lib/key_gen');
//var mailer = require('../lib/mailer');

module.exports = function(app, jwtAuth) {
  // get single box
  app.get('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    var query = {boxKey: req.params.boxKey};
    query['members.' + req.user.email] = {$exists: true};
    Box.findOne(query)
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
    console.log('Adding ' + req.body.email + ' to ' + req.params.boxKey);
    var query = {boxKey: req.params.boxKey};
    query['members.' + req.user.email] = {$exists: true};
    Box.findOne(query, function(err, box) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve box');
      }
      var temp = box.members;
      box.members = undefined;
      temp[req.body.email] = {
        unread: 1
      };
      box.members = temp;
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
    var query = {boxKey: req.params.boxKey};
    query['members.' + req.user.email] = {$exists: true};
    Box.findOne(query, function(err, box) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve box');
      }
      var temp = box.members;
      box.members = undefined;
      delete temp[req.user.email];
      box.members = temp;
      box.save(function(err) {
        if (err) {
          console.log(err);
          return res.status(500).send('there was an error');
        }
        console.log(req.user.email + ' left ' + box.boxKey);
        res.json({msg: 'left box'});
      });
    });
  });

  // get inbox
  app.get('/api/boxes', jwtAuth, function(req, res) {
    var query = {};
    query['members.' + req.user.email] = {$exists: true};
    Box.find(query, function(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve boxes');
      }
      var boxes = [];
      data.forEach(function(box) {
        boxes.push({
          subject: box.subject,
          date: box.date,
          boxKey: box.boxKey,
          members: box.members,
          unread: box.members[req.user.email].unread
        });
      });
      var response = {
        name: req.user.email,
        inbox: boxes
      };
      res.json(response);
    });
  });

  //send box
  app.post('/api/boxes', jwtAuth, function(req, res) {
    console.log('post route hit');
    var post = new Post();
    post.content = req.body.post;
    post.by = req.user.email;
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
      box.members = {};
      box.members[req.user.email] = {
        unread: 0
      };
      req.body.members.forEach(function(member) {
        box.members[member] = {
          unread: 1
        };
      });
      box.thread = [post._id];
    } catch (err) {
      console.log(err);
      return res.status(400).send('invalid input');
    }
    box.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      console.log('Made box ' + box.boxKey);
      //add checker for flybox user here
      /*var mailOptions = {
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
      mailer(mailOptions, smtpOptions);*/

      res.json({msg: 'sent!'});
    });
  });
};
