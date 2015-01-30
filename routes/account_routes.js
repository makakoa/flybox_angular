'use strict';

var jwt = require('jwt-simple');

module.exports = function(app, jwtAuth, logging) {
  var secret = app.get('accountSecret');

  //Account info
  app.get('/api/account/', jwtAuth, function(req, res) {
    if (logging) console.log('fly[a]: Getting info for ' + req.user.email);
    res.json(req.user);
  });

  //Set current name
  app.put('/api/account/name', jwtAuth, function(req, res) {
    if (logging) console.log('fly[a]: ' + req.user.displayName + ' is now ' + req.body.newName);
    req.user.displayName = req.body.newName;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'saved'});
    });
  });

  //Set current account
  app.put('/api/account/current', jwtAuth, function(req, res) {
    if (logging) console.log('fly[a]: ' + req.user.email + ' switching to ' + req.user.accounts[req.body.number].auth.user);
    req.user.current = req.body.number;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'switched to ' + req.user.accounts[req.user.current].auth.user});
    });
  });

  //Add email account
  app.post('/api/account/new', jwtAuth, function(req, res) {
    if (logging) console.log('fly[a]: Adding account to ' + req.user.email);
    var account = {};
    try {
      account.email = req.body.email;
      account.password = jwt.encode(req.body.password, secret);
      account.lastImported = 1;
      if (req.body.service) {
        account.service = req.body.service;
      } else {
        account.smtp = {
          host: req.body.smtp.host,
          port: req.body.smtp.port,
          secure: req.body.smtp.secure
        };
        account.imap = {
          host: req.body.imap.host,
          port: req.body.imap.port,
          tls: req.body.imap.tls
        };
      }
    } catch (err) {
      handle(err, res);
    }
    req.user.accounts.push(account);
    req.user.current = req.user.accounts.length - 1;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'added'});
    });
  });

  //Edit an email account
  app.put('/api/account', jwtAuth, function(req, res) {
    if (logging) console.log('fly[a]: Changing account for ' + req.user.email);
    var account = {};
    account._id = req.body._id;
    try {
      account.email = req.body.email;
      account.password = jwt.encode(req.body.password, secret);
      if (req.body.service) {
        account.service = req.body.service;
      } else {
        account.smtp = {
          host: req.body.smtp.host,
          port: req.body.smtp.port,
          secure: req.body.smtp.secure
        };
        account.imap = {
          host: req.body.imap.host,
          port: req.body.imap.port,
          tls: req.body.imap.tls
        };
      }
    } catch (err) {
      handle(err, res);
    }
    req.user.accounts.id(req.body._id).remove();
    req.user.accounts.push(account);
    req.user.current = req.user.accounts.length - 1;
    req.user.save(function(err) {
      if (err) handle(err, res);
      res.json({msg: 'account updated'});
    });
  });

  //Delete an email account
  app.delete('/api/account/remove/:id', jwtAuth, function(req, res) {
    if (logging) console.log('fly[a]: Deleting account from ' + req.user.email);
    req.user.accounts.id(req.params.id).remove();
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
