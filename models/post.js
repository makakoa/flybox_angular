'use strict';

var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  by: String,
  content: String,
  html: String,
  date: {type: Date, default: Date.now}
});

module.exports = mongoose.model ('Post', postSchema);
