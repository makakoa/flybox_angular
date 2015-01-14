'use strict';

module.exports = function(app, jwtAuth) {
  app.get('/account/', jwtAuth, function(req, res) {
    res.json(req.user);
  });

  app.post('/account/smtp', jwtAuth, function(req, res) {
    var smtp;
    try {
      smtp = {
        service: req.body.host,
        auth: {
          user: req.body.username,
          pass: req.body.password
        }
      };
      /*smtp = {
        host: req.body.host,
        port: req.body.port,
        username: req.body.username,
        password: req.body.password, // TODO: add some sort of encryption
        secure: true
      };*/
    } catch (err) {
      return res.status(500).send('there was an error adding account');
    }
    req.user.smtps.push(smtp);
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
    req.user.smtps.id(req.body._id).host = req.body.host;
    req.user.smtps.id(req.body._id).port = req.body.port;
    req.user.smtps.id(req.body._id).username = req.body.username;
    req.user.smtps.id(req.body._id).password = req.body.password;

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
