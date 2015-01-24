'use strict';

module.exports = function(app) {
  app.directive('inboxSection', function() {
    return {
      restrict: 'AEC',
      transclude: true,
      templateUrl: 'templates/inbox.html',
      controller: 'InboxCtrl'
    };
  });
};
