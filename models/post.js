'use strict';

var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  by: String,
  content: String,
  date: {type: Date, default: Date.now},
});

module.exports = mongoose.model ('Post', postSchema);
