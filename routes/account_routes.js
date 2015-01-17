'use strict';

module.exports = function(app, jwtAuth, logging) {
  app.get('/api/account/', jwtAuth, function(req, res) {
    if (logging) console.log('fly[]: Getting info for ' + req.user.email);
    res.json(req.user);
  });

  app.put('/api/account/name', jwtAuth, function(req, res) {
    if (logging) console.log('fly[]: ' + req.user.displayName + ' is now ' + req.body.newName);
    req.user.displayName = req.body.newName;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'saved'});
    });
  });

  app.put('/api/account/current', jwtAuth, function(req, res) {
    if (logging) console.log('fly[]: ' + req.user.email + ' switching to ' + req.user.smtps[req.body.number].auth.user);
    req.user.current = req.body.number;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'switched to ' + req.user.smtps[req.user.current].auth.user});
    });
  });

  app.post('/api/account/smtp', jwtAuth, function(req, res) {
    if (logging) console.log('fly[]: Adding smtp smtp to ' + req.user.email);
    var smtp;
    if (req.body.service) {
      try {
        smtp = {
          service: req.body.service,
          auth: {
            user: req.body.auth.user,
            pass: req.body.auth.pass // TODO: add some sort of encryption
          }
        };
      } catch (err) {
        handle(err, res);
      }
    } else {
      try {
        smtp = {
          host: req.body.host,
          secureConnection: req.body.secureConnection,
          port: req.body.port,
          auth: {
            user: req.body.auth.user,
            pass: req.body.auth.pass // TODO: add some sort of encryption
          }
        };
      } catch (err) {
        handle(err, res);
      }
    }
    req.user.smtps.push(smtp);
    req.user.current = req.user.smtps.length - 1;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'added'});
    });
  });

  app.put('/api/account/smtp', jwtAuth, function(req, res) {
    if (logging) console.log('fly[]: Changing smtp for ' + req.user.email);
    req.user.smtps.id(req.body._id).auth.user = req.body.auth.user;
    req.user.smtps.id(req.body._id).auth.pass = req.body.auth.pass;
    req.user.smtps.id(req.body._id).service = req.body.service;
    req.user.smtps.id(req.body._id).host = req.body.host;
    req.user.smtps.id(req.body._id).secureConnection = req.body.secureConnection;
    req.user.smtps.id(req.body._id).port = req.body.port;

    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'saved'});
    });
  });

  app.delete('/api/account/smtp/:id', jwtAuth, function(req, res) {
    if (logging) console.log('fly[]: Deleting smtp from ' + req.user.email);
    req.user.smtps.id(req.params.id).remove();
    req.user.current = 0;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'deleted'});
    });
  });

  var handle = function(err, res) {
    console.log(err);
    return res.status(500).send('Account Error');
  };
};
