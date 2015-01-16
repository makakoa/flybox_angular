'use strict';

var Box = require('../models/box');
var Post = require('../models/post');

module.exports = function(socket) {

  socket.on('init', function(data) {
    socket.user = data.user; // should replace with jwt route
    socket.join(data.room);
    socket.room = data.room;
    console.log(data.name + ' joined room:' + socket.room);
  });

  socket.on('read', function() {
    socket.broadcast.to(socket.room).emit('read', {
      by: socket.user.name
    });

    Box.findOne({boxKey: socket.room}, function(err, box) {
      box.members.forEach(function(member) {
        if (member.email === socket.user.name) {
          member.unread = 0;
        }
      });
      box.save(function(err) {
        if (err) return console.log(err);
      });
    });
  });

  socket.on('send:post', function(data) {
    console.log(socket.user.name + ' posted in room:' + socket.room);
    socket.broadcast.to(socket.room).emit('send:post', {
      content: data.content,
      by: socket.user.name,
      date: Date.now()
    });

    var post = new Post();
    post.by = socket.user.name;
    post.content = data.content;
    post.date = Date.now();
    post.save(function(err) {
      if (err) return console.log(err);
      Box.findOne({boxKey: data.box}, function(err, box) {
        if (err) return console.log(err);
        box.thread.push(post._id);
        box.members.forEach(function(member) {
          member.unread += 1;
          if (member.email === socket.user.name) member.unread = 0;
        });
        box.save(function(err) {
          if (err) return console.log(err);
        });
      });
    });
  });

  socket.on('edit:post', function(data) {
    Post.findOne({_id: data._id}, function(err, post) {
      if (err) return console.log(err);
      if (post.by !== socket.user.name) return console.log('access error');
      if (data.delete) {
        post.by = 'deleted';
        data.content = '';
      }
      post.content = data.content;
      post.save(function(err) {
        if (err) return console.log(err);
        console.log('saved');
      });

      socket.broadcast.to(socket.room).emit('edit:post', {
        _id: post._id,
        by: post.by,
        content: post.content
      });
    });
  });
};
