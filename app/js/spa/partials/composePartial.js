'use strict';

module.exports = function(app) {
  app.directive('composeBox', function() {
    return {
      restrict: 'AEC',
      transclude: true,
      templateUrl: 'templates/compose.html',
      controller: 'ComposeCtrl'
    };
  });
};
