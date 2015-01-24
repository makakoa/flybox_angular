'use strict';

module.exports = function(app) {
  require('./controllers/guest_controller')(app);
};
