'use strict';

var Box = require('../models/box');
var Post = require('../models/post');
var format = require('../lib/format');
var mailFactory = require('../lib/mailFactory');

module.exports = function(io, secret, logging) {

  var auth = require('../lib/socket_auth')(secret);
  var rooms = {}; //use for box online
  var accounts = {}; //use for notifications
  if (accounts);

  var enterRoom = function(room, socket) {
    if (socket.room) {
      delete rooms[socket.room][socket.as];
      if (rooms[socket.room].length < 1) {
        delete rooms[socket.room];
      } else {
        io.to(socket.room).emit('update:room', {
          online: rooms[socket.room]
        });
      }
      socket.leave(socket.room);
    }
    if (!rooms[room]) rooms[room] = {};
    socket.join(room); //should check if user is in box
    socket.room = room;
    rooms[socket.room][socket.as] = true; // fill with info
    io.to(room).emit('update:room', {
      online: rooms[socket.room]
    });
  };

  var notify = function(members, not) {
    members.forEach(function(member) {
      if (!accounts[member.email]) return;
      io.to(accounts[member.email]).emit('notification', not);
    });
  };

  return function(socket) {
    socket.on('log:in', function(data) {
      auth(data.token, function(user) {
        if (!user) socket.disconnect();
        socket.user = user;
        if (user.accounts.length) {
          socket.as = user.accounts[user.current].email;
          accounts[socket.as] = socket.id;
        }
      });
    });

    socket.on('init:guest', function(data, callback) {
      console.log('fly[]: Guest: ' + data.token + ' in room: ' + data.boxKey);
      Box.findOne({boxKey: data.boxKey}, function(err, box) {
        if (err) console.log(err);
        var guest = {};
        box.members.forEach(function(member) {
          if (member.guestKey == data.token) {
            guest = member;
          }
        });
        socket.user = guest;
        socket.as = guest.email;
        socket.room = data.boxKey;
        enterRoom(data.boxKey, socket);
        callback(guest.email);
      });
    });

    socket.on('update:account', function(data) {
      auth(data.token, function(user) {
        if (!user) socket.disconnect();
        if (socket.as) delete accounts[socket.as];
        socket.user = user;
        socket.as = user.accounts[user.current].email;
        accounts[socket.as] = socket.id;
      });
    });

    socket.on('join:box', function(data) {
      if (!socket.user) socket.disconnect();
      if (logging) console.log('fly[]: ' + socket.user.email + ' joining room:' + data.room);
      enterRoom(data.room, socket);
    });

    socket.on('read', function() {
      if (!socket.user) socket.disconnect();
      socket.broadcast.to(socket.room).emit('read', {
        by: socket.as
      });
      Box.findOne({boxKey: socket.room}, function(err, box) {
        box.members.forEach(function(member) {
          if (member.email === socket.as) {
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
      if (logging) console.log('fly[]: ' + socket.user.email + ' posted in room:' + socket.room);
      socket.broadcast.to(socket.room).emit('send:post', {
        content: data.content,
        html: data.html,
        by: socket.as,
        date: Date.now()
      });
      var post = new Post();
      post.by = socket.as;
      post.content = data.content;
      post.html = data.html;
      post.date = Date.now();
      post.save(function(err) {
        if (err) return console.log(err);
        Box.findOne({boxKey: data.box}, function(err, box) {
          if (err) return console.log(err);
          var recipients = [];
          var notifications = [];
          box.thread.push(post._id);
          box.members.forEach(function(member) {
            if (member.email === socket.as) {
              member.unread = 0;
            } else if (accounts[member.email]) {
              notifications.push(member);
              member.unread += 1;
            } else {
              recipients.push(member);
              member.unread += 1;
            }
          });
          notify(notifications, {msg: 'New post in ' + box.subject, boxKey: box.boxKey});
          box.save(function(err) {
            if (err) return console.log(err);
            if (data.sendEmail) {
              if (logging) console.log('fly[]: Posted, mailing post as ' + socket.as);
              var smtp = format.smtp(socket.user.accounts[socket.user.current]);
              var mail = {
                from: socket.as,
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
        if (post.by !== socket.as) return console.log('access error');
        if (data.delete) {
          post.by = 'deleted';
          data.content = '';
          data.html = undefined;
        }
        post.content = data.content;
        post.html = data.html;
        post.save(function(err) {
          if (err) return console.log(err);
          console.log('fly[]: Post updated');
        });

        socket.broadcast.to(socket.room).emit('edit:post', post);
      });
    });

    socket.on('disconnect', function() {
      if (socket.room) {
        delete rooms[socket.room][socket.as];
        if (rooms[socket.room].length < 1) {
          delete rooms[socket.room];
        } else {
          io.to(socket.room).emit('update:room', {
            online: rooms[socket.room]
          });
        }
      }
    });
  };
};
