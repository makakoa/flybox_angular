'use strict';

var mongoose = require('mongoose');

var boxSchema = mongoose.Schema({
  subject: String,
  boxKey: String,
  members: [{email: String, guestKey: String, unread: Number}],
  date: {type: Date, default: Date.now},
  thread: [{type:mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  originalMessageId: String
});

module.exports = mongoose.model('Box', boxSchema);
