'use strict';

var User = require('../models/user');

module.exports = function(app, passport) {
  app.get('/api/users', passport.authenticate('basic', {session: false}), function(req, res) {
    console.log('fly[]: ' + req.user.email + ' logged in');
    res.json({jwt: req.user.generateToken(app.get('jwtSecret'))});
  });

  app.post('/api/users', function(req, res) {
    console.log('fly[]: Creating account ' + req.body.email);
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

  app.delete('/api/users', passport.authenticate('basic', {session:false}), function(req, res) {
    console.log('fly[]: Deleting account ' + req.user.email);
    User.remove({_id: req.user._id}, function(err) {
      if (err) return res.status(500).send('there was an error');
      res.json({msg: 'deleted'});
    });
  });
};
