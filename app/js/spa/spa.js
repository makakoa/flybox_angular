'use strict';

module.exports = function(app) {
  require('./controllers/spa_controller')(app);

  // controllers
  require('./inbox/inbox')(app);
  require('./account/account')(app);
  require('./compose/compose')(app);
  require('./box/box')(app);

  // partials
  require('./partials/inboxPartial')(app);
  require('./partials/boxPartial')(app);
  require('./partials/composePartial')(app);
  require('./partials/accountPartial')(app);
};
