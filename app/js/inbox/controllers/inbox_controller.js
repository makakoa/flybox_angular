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
            $scope.current = data.current;
            $scope.accounts = data.accounts;
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

      $scope.switchTo = function(accountNum) {
        $http({
          method: 'PUT',
          url: '/api/account/current',
          headers: {
            jwt: $cookies.jwt
          },
          data: {
            number: accountNum
          }
        })
        .success(function() {
          $scope.index();
        });
      };

      $scope.goToBox = function(boxKey) {
        return $location.path('/box/' + boxKey);
      };

      $scope.logOut = function() {
        delete $cookies.jwt;
        return $location.path('/');
      };
    }]);
};
