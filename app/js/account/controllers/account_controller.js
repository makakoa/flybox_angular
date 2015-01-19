'use strict';

module.exports = function(app) {
  app.controller('AccountCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
    function($scope, $http, $base64, $cookies, $location) {
      if (!$cookies.jwt) {
        console.log('Redirecting');
        $location.path('/');
      }

      $scope.index = function() {
        $http({
          method: 'GET',
          url: '/api/account/',
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          $scope.user = data;
          $scope.username = data.email;
        });
      };

      $scope.setName = function() {
        $http({
          method: 'PUT',
          url: '/api/account/name',
          headers: {jwt: $cookies.jwt},
          data: $scope.user
        })
        .success(function() {
          $scope.user.displayName = $scope.user.newName;
        });
      };

      $scope.switchTo = function(account) {
        $http({
          method: 'PUT',
          url: '/api/account/current',
          headers: {
            jwt: $cookies.jwt
          },
          data: {
            number: $scope.accounts.indexOf(account)
          }
        })
        .success(function() {
          $scope.user.current = $scope.accounts.indexOf(account);
        });
      };

      $scope.import = function(account) {
        $http({
          method: 'POST',
          url: '/api/emails/import/',
          headers: {
            jwt: $cookies.jwt
          },
          data: {index: $scope.user.accounts.indexOf(account)}
        })
        .success(function() {
          console.log('emails imported');
        });
      };

      $scope.add = function() {
        $http({
          method: 'POST',
          url: '/api/account/new',
          headers: {jwt: $cookies.jwt},
          data: $scope.newAccount
        })
        .success(function() {
          var temp = $scope.newAccount;
          $scope.user.accounts.push(temp);
          $scope.adding = false;
          $scope.newAccount = {};
        });
      };

      $scope.edit = function(account) {
        $http({
          method: 'PUT',
          url: '/api/account/',
          headers: {jwt: $cookies.jwt},
          data: account
        })
        .success(function() {
          account.editing = false;
        });
      };

      $scope.delete = function(account) {
        $http({
          method: 'DELETE',
          url: '/api/account/remove' + account._id,
          headers: {jwt: $cookies.jwt}
        })
        .success(function() {
          $scope.user.accounts.splice($scope.user.accounts.indexOf(account), 1);
        });
      };

      $scope.logOut = function() {
        delete $cookies.jwt;
        return $location.path('/');
      };
    }]);
};
