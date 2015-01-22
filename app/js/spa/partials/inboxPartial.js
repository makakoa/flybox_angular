'use strict';

module.exports = function(app) {
  app.directive('inbox', function() {
    return {
      restrict: 'AEC',
      transclude: true,
      scope: {},
      templateUrl: 'templates/inbox.html',
      controller: 'InboxCtrl'
    };
  });
};
