'use strict';

var Box = require('../models/box');
var Post = require('../models/post');
var key = require('../lib/key_gen');

module.exports = function(app, jwtAuth) {
  app.get('/api/boxes/:boxKey', jwtAuth, function(req, res) {
    Box.findOne({boxKey: req.params.boxKey,
              members: {$elemMatch: {email: req.user.email}}})
    .populate('thread')
    .exec(function(err, data) {
      if(err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve box');
      }
      res.json(data);
    });
  });
  
  // get index
  app.get('/api/boxes', jwtAuth, function(req, res) {
    Box.find({members: {$elemMatch: {email: req.user.email}}}, function(err, data) {
      if (err) {
        console.log(err);
        return res.status(500).send('Cannot retrieve boxes');
      }
      var response = [];
      data.forEach(function(box) {
        var key;
        box.members.forEach(function(member) {
          if (req.user.email === member.email) {
            key = member.urlKey;
          }
        });
        response.push({
          email: box.members[0].email,
          subject: box.subject,
          date: box.date,
          boxKey: box.boxKey,
          userKey: key
        });
      });
      res.json(response);
    });
  });

  //send box
  app.post('/api/boxes', jwtAuth, function(req, res) {
    var post = new Post(req.body.post);
    post.save(function(err) { //TODO: might need to return id
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
    });
    var box = new Box();
    try {
      box.subject = req.body.subject;
      box.boxKey = key();
      box.members = [{email: req.user.email, unread: 0}];
      req.body.members.forEach(function(member) {
        box.members.push({email: member, unread: 0});
      });
      box.thread = [post._id];
    } catch (err) {
      return res.status(400).send('invalid input');
    }
    console.log(box);
    box.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      res.json({msg: 'sent!'});
    });
  });
};
