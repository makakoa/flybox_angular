'use strict';

module.exports = function(app) {
  app.controller('InboxCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
    function($scope, $http, $base64, $cookies, $location) {
      if (!$cookies.jwt) {
        console.log('redirecting');
        $location.path('/');
      }

      $scope.index = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {
            jwt: $cookies.jwt
          }
        })
          .success(function(data) {
            $scope.username = data.name;
            $scope.boxes = data.inbox;
          })
          .error(function(err) {
            console.log(err);
          });
      };

      $scope.index();

      $scope.import = function() {
        $http({
          method: 'GET',
          url: '/api/emails/import',
          headers: {
            jwt: $cookies.jwt
          }
        })
        .success(function() {
          $scope.index();
        });
      };

      $scope.goToBox = function(boxKey, isBox) {
        return $location.path('/box/' + boxKey + '/' + isBox);
      };

      $scope.logOut = function() {
        delete $cookies.jwt;
        return $location.path('/');
      };
    }]);
};
