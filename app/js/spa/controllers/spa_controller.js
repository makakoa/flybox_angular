'use strict';

module.exports = function(app) {
  app.controller('SpaCtrl', ['$scope', '$http', '$cookies', '$location', 'socket',
    function($scope, $http, $cookies, $location, socket) {
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
          if (!data.user.name) $scope.logOut();
          console.log(data);
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

      $scope.search = function() {
        $scope.$broadcast('search', $scope.searchParams);
      };

      $scope.sync = function() {
        $http({
          method: 'POST',
          url: '/api/emails/import/',
          headers: {
            jwt: $cookies.jwt
          },
          data: {index: $scope.user.current}
        })
        .success(function() {
          setTimeout($scope.$broadcast('update:inbox'), 5000);
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
        .success(function(data) {
          console.log(data.msg);
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
