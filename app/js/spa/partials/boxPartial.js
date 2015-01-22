'use strict';

module.exports = function(app) {

  app.directive('singleBox', function() {
    return {
      restrict: 'AEC',
      transclude: true,
      templateUrl: 'templates/box.html',
      controller: 'BoxCtrl'
    };
  });
};
