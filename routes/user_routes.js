'use strict';

var User = require('../models/user');

module.exports = function(app, passport, logging) {
  //User login
  app.get('/api/users', passport.authenticate('basic', {session: false}), function(req, res) {
    if (logging) console.log('fly[u]: ' + req.user.email + ' logged in');
    res.json({jwt: req.user.generateToken(app.get('jwtSecret'))});
  });

  //Create account
  app.post('/api/users', function(req, res) {
    if (logging) console.log('fly[u]: Creating account ' + req.body.email);
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) return res.status(500).send('server error');
      if (user) return res.status(500).send('cannot create that user');
      var newUser = new User();
      newUser.email = req.body.email;
      newUser.password = newUser.generateHash(req.body.password);
      newUser.displayName = req.body.email;
      newUser.save(function(err) {
        if (err) return res.status(500).send('server error');
        res.json({jwt: newUser.generateToken(app.get('jwtSecret'))});
      });
    });
  });

  //Check flybox for email
  app.post('/api/user/check', function(req, res) {
    if (logging) console.log('fly[u]: Searching for ' + req.body.email);
    User.findOne({accounts: {$elemMatch: {email: req.body.email}}}, function(err, user) {
      if (err) return res.status(500).send('server error');
      if (user) {
        return res.json({isUser: true, name: user.displayName});
      } else {
        return res.json({isUser: false});
      }
    });
  });

  //Delete account
  app.delete('/api/users', passport.authenticate('basic', {session:false}), function(req, res) {
    if (logging) console.log('fly[u]: Deleting account ' + req.user.email);
    User.remove({_id: req.user._id}, function(err) {
      if (err) return res.status(500).send('there was an error');
      res.json({msg: 'deleted'});
    });
  });
};
