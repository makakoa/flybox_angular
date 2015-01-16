'use strict';

module.exports = function(app, jwtAuth) {
  app.get('/account/', jwtAuth, function(req, res) {
    console.log('Getting info for ' + req.user.email);
    res.json(req.user);
  });

  app.put('/account/name', jwtAuth, function(req, res) {
    console.log('Changing ' + req.user.displayName + ' to ' + req.body.newName);
    req.user.displayName = req.body.newName;
    req.user.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      res.json({msg: 'saved'});
    });
  });

  app.put('/account/current', jwtAuth, function(req, res) {
    console.log(req.user.displayName + ' switching to ' + req.user.smtps[req.body.number].auth.user);
    req.user.current = req.body.number;
    req.user.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      res.json({msg: 'switched to ' + req.user.smtps[req.user.current].auth.user});
    });
  });

  app.post('/account/smtp', jwtAuth, function(req, res) {
    console.log('Adding smtp account for ' + req.user.email);
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
        return res.status(500).send('there was an error adding account');
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
        return res.status(500).send('there was an error adding account');
      }
    }
    req.user.smtps.push(smtp);
    req.user.current = req.user.smtps.length - 1;
    req.user.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      console.log('Account added to ' + req.user.email);
      res.json({msg: 'added'});
    });
  });

  app.put('/account/smtp', jwtAuth, function(req, res) {
    console.log('Changing smtp account for ' + req.user.email);
    req.user.smtps.id(req.body._id).auth.user = req.body.auth.user;
    req.user.smtps.id(req.body._id).auth.pass = req.body.auth.pass;
    req.user.smtps.id(req.body._id).service = req.body.service;
    req.user.smtps.id(req.body._id).host = req.body.host;
    req.user.smtps.id(req.body._id).secureConnection = req.body.secureConnection;
    req.user.smtps.id(req.body._id).port = req.body.port;

    req.user.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      res.json({msg: 'saved'});
    });
  });

  app.delete('/account/smtp/:id', jwtAuth, function(req, res) {
    console.log('Deleting account from ' + req.user.email);
    req.user.smtps.id(req.params.id).remove();

    req.user.save(function(err) {
      if (err) {
        console.log(err);
        return res.status(500).send('there was an error');
      }
      res.json({msg: 'deleted'});
    });
  });
};
