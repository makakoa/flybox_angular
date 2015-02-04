'use strict';

module.exports = function(app) {
  app.factory('socket', ['socketFactory',
    function(socketFactory) {
      var socket = socketFactory({
        ioSocket: window.io.connect()
      });
      socket.addOn = function(event, cb) {
        if (socket.hasOwnProperty('$events') && socket.$events.hasOwnProperty(event)) return;
        socket.on(event, cb);
      };
      return socket;
    }]);
};
