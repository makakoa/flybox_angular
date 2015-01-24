'use strict';

module.exports = function(app) {
  app.controller('SpaCtrl', ['$scope', '$http', '$base64', '$cookies', '$location', 'socket',
    function($scope, $http, $base64, $cookies, $location, socket) {
      if (!$cookies.jwt) {
        console.log('Redirecting');
        $location.path('/');
      }

      $scope.init = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          $scope.user = data.user;
          $scope.current = data.current;
          $scope.accounts = data.accounts;
          socket.emit('log:in', {
            token: $cookies.jwt
          });
        })
        .error(function(err) {
          console.log(err);
        });
      };

      $scope.switchTo = function(account) {
        $http({
          method: 'PUT',
          url: '/api/account/current',
          headers: {jwt: $cookies.jwt},
          data: {
            number: $scope.accounts.indexOf(account)
          }
        })
        .success(function() {
          socket.emit('account:switch', {
            token: $cookies.jwt
          });
        });
      };

      $scope.logOut = function() {
        delete $cookies.jwt;
        return $location.path('/');
      };
    }]);
};
