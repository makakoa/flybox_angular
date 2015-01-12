'use strict';

var Box = require('../models/box');
var Post = require('../models/post');

module.exports = function(socket) {

  socket.emit('init', {
    name: 'filler name'
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

    socket.broadcast.emit('send:post', {
      content: post.message,
      by: post.by,
      date: Date.now()
    });
  });
};
