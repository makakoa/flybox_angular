'use strict';

module.exports = function(app) {
  app.controller('ComposeCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
    function($scope, $http, $base64, $cookies, $location) {
      if (!$cookies.jwt) {
        console.log('redirecting');
        $location.path('/');
      }

      $scope.send = function() {
        $scope.newBox.members = $scope.newBox.members.split(' ');
        $http({
          method: 'POST',
          url: '/api/boxes',
          headers: {jwt: $cookies.jwt},
          data: $scope.newBox
        })
        .success(function() {
          console.log('sent!');
        })
        .error(function(data) {
          console.log(data);
        });
      };
    }]);
};
