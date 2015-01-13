'use strict';

module.exports = function(app, jwtAuth) {
  app.get('/account/', jwtAuth, function(req, res) {
    res.json(req.user);
  });
};
