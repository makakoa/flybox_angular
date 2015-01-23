'use strict';

var Box = require('../models/box');
var Post = require('../models/post');
var format = require('../lib/format');
var mailFactory = require('../lib/mailFactory');

module.exports = function(secret, logging) {
  var auth = require('../lib/socket_auth')(secret);
  var online = {};

  return function(socket) {
    socket.on('log:in', function(data) {
      auth(data.token, function(user) {
        if (!user) socket.disconnect();
        socket.user = user;
        online[user.email] = user.accounts[user.current].email;
      });
    });

    socket.on('account:switch', function(data) {
      auth(data.token, function(user) {
        if (!user) socket.disconnect();
        online[user.email] = user.accounts[user.current].email;
      });
    });

    socket.on('join:box', function(data) {
      if (!socket.user) socket.disconnect();
      if (logging) console.log('fly[]: ' + socket.user.email + ' joined room:' + socket.room);
      socket.join(data.room); //should check if user is in box
      socket.room = data.room;
    });

    socket.on('read', function() {
      if (!socket.user) socket.disconnect();
      socket.broadcast.to(socket.room).emit('read', {
        by: socket.user.accounts[socket.user.current].email
      });
      Box.findOne({boxKey: socket.room}, function(err, box) {
        box.members.forEach(function(member) {
          if (member.email === socket.user.accounts[socket.user.current].email) {
            member.unread = 0;
          }
        });
        box.save(function(err) {
          if (err) return console.log(err);
        });
      });
    });

    socket.on('send:post', function(data) {
      if (!socket.user) socket.disconnect();
      if (logging) console.log('fly[]: ' + socket.user.accounts[socket.user.current].email + ' posted in room:' + socket.room);
      socket.broadcast.to(socket.room).emit('send:post', {
        content: data.content,
        by: socket.user.accounts[socket.user.current].email,
        date: Date.now()
      });
      var post = new Post();
      post.by = socket.user.accounts[socket.user.current].email;
      post.content = data.content;
      post.date = Date.now();
      post.save(function(err) {
        if (err) return console.log(err);
        Box.findOne({boxKey: data.box}, function(err, box) {
          if (err) return console.log(err);
          var recipients = [];
          box.thread.push(post._id);
          box.members.forEach(function(member) {
            recipients.push(member);
            member.unread += 1;
            if (member.email === socket.user.accounts[socket.user.current].email) member.unread = 0;
          });
          box.save(function(err) {
            if (err) return console.log(err);
            if (data.sendEmail) {
              if (logging) console.log('fly[]: Posted, mailing post as ' + socket.user.accounts[socket.user.current].email);
              var smtp = format.smtp(socket.user.accounts[socket.user.current]);
              var mail = {
                from: socket.user.accounts[socket.user.current].email,
                name: socket.user.displayName,
                to: recipients,
                subject: box.subject,
                text: post.content
              };
              mailFactory(smtp, mail, logging, function() {return;});
            }
          });
        });
      });
    });

    socket.on('edit:post', function(data) {
      if (!socket.user) socket.disconnect();
      Post.findOne({_id: data._id}, function(err, post) {
        if (err) return console.log(err);
        if (post.by !== socket.user.accounts[socket.user.current].email) return console.log('access error');
        if (data.delete) {
          post.by = 'deleted';
          data.content = '';
        }
        post.content = data.content;
        post.save(function(err) {
          if (err) return console.log(err);
          console.log('fly[]: Post updated');
        });

        socket.broadcast.to(socket.room).emit('edit:post', {
          _id: post._id,
          by: post.by,
          content: post.content
        });
      });
    });

    socket.on('disconnect', function() {
      delete online[socket.user.email];
    });
  };
};
