'use strict';

module.exports = function(app) {
  app.directive('accountPage', function() {
    return {
      restrict: 'AEC',
      transclude: true,
      templateUrl: 'templates/account.html',
      controller: 'AccountCtrl'
    };
  });
};
