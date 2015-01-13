'use strict';

module.exports = function(app) {
  app.controller('AccountCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
    function($scope, $http, $base64, $cookies, $location) {
      if (!$cookies.jwt) {
        console.log('redirecting');
        $location.path('/');
      }

      $scope.index = function() {
        $http({
          method: 'GET',
          url: '/account/',
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          $scope.user = data;
          $scope.username = data.email;
        });
      };

      $scope.index();
    }]);
};
