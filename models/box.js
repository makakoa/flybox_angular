'use strict';

var mongoose = require('mongoose');

var boxSchema = mongoose.Schema({
  subject: String,
  boxKey: String,
  members: {type: mongoose.Schema.Types.Mixed},
  date: {type: Date, default: Date.now},
  thread: [{type:mongoose.Schema.Types.ObjectId, ref: 'Post'}]
});

module.exports = mongoose.model('Box', boxSchema);
