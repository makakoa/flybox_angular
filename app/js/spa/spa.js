'use strict';

module.exports = function(app) {
  require('./controllers/spa_controller')(app);
  require('./partials/inboxPartial')(app);
  require('./partials/boxPartial')(app);
  require('./partials/composePartial')(app);
  require('./partials/accountPartial')(app);
};
