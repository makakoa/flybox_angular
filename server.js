'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bp = require('body-parser');

var app = express();
app.use(bp.json());

var port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URL ||
                process.env.MONGOLAB_URI ||
                process.env.MONGOHQ_URL ||
                'mongodb://localhost/flybox_test');

require('./lib/passport')(passport);
var jwtAuth = require('./lib/jwt_auth')(app.get('jwtSecret'));
require('./routes/user_routes')(app, passport, jwtAuth);
require('./routes/box_routes')(app, jwtAuth);

app.listen(port, function() {
  console.log('Server listening on port ' + port);
});