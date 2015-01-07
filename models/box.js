'use strict';

var mongoose = require('mongoose');

var boxSchema = mongoose.Schema({
  subject: String,
  boxKey: String,
  members: [{email: String, urlKey: String, unread: Number}],
  date: {type: Date, default: Date.now},
  thread: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('Box', boxSchema);
