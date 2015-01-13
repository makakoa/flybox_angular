'use strict';

var Box = require('../models/box');
var Post = require('../models/post');

module.exports = function(socket) {
  var online = {};

  socket.on('init', function(data) {
    online[data.name] = data.room;
    socket.join(data.room);
  });

  socket.on('send:post', function(data) {
    console.log('post received');
    var post = new Post();
    post.by = data.by;
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

    socket.broadcast.to(socket.room).emit('send:post', {
      content: post.message,
      by: post.by,
      date: Date.now()
    });
  });

  socket.on('edit:post', function(data) {
    Post.findOne({_id: data._id}, function(err, post) {
      if (err) return console.log(err);
      if (post.by !== data.by) return console.log('access error');
      post.content = data.content;
      post.by = data.by;
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
