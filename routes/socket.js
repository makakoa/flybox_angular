'use strict';

var Box = require('../models/box');
var Post = require('../models/post');

module.exports = function(socket) {

  socket.on('init', function(data) {
    socket.username = data.name; // should replace with jwt route
    socket.join(data.room);
    socket.room = data.room;
    console.log(data.name + ' joined room:' + socket.room);
  });

  socket.on('send:post', function(data) {
    console.log('post received');
    var post = new Post();
    post.by = socket.username;
    post.content = data.content;
    post.date = Date.now();
    post.save(function(err) {
      if (err) {
        console.log(err);
        return;
      }
      Box.findOneAndUpdate({boxKey: data.box}, {$push: {thread: post._id}}, function(err) {
        if (err) return console.log(err);
      });
      console.log('post saved');
    });

    console.log(socket.username + ' posted in room:' + socket.room);
    socket.broadcast.to(socket.room).emit('send:post', {
      content: post.content,
      by: socket.username,
      date: Date.now()
    });
  });

  socket.on('edit:post', function(data) {
    Post.findOne({_id: data._id}, function(err, post) {
      if (err) return console.log(err);
      if (post.by !== socket.username) return console.log('access error');
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
