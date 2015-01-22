'use strict';

module.exports = function(app) {
  app.controller('AccountCtrl', ['$scope', '$http', '$base64', '$cookies',
    function($scope, $http, $base64, $cookies) {

      $scope.indexUser = function() {
        $http({
          method: 'GET',
          url: '/api/account/',
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          $scope.info = data;
          $scope.username = data.email;
        });
      };

      $scope.setName = function() {
        $http({
          method: 'PUT',
          url: '/api/account/name',
          headers: {jwt: $cookies.jwt},
          data: $scope.info
        })
        .success(function() {
          $scope.info.displayName = $scope.info.newName;
        });
      };

      $scope.import = function(account) {
        $http({
          method: 'POST',
          url: '/api/emails/import/',
          headers: {
            jwt: $cookies.jwt
          },
          data: {index: $scope.info.accounts.indexOf(account)}
        })
        .success(function() {
          console.log('emails imported');
        });
      };

      $scope.addAccount = function() {
        $http({
          method: 'POST',
          url: '/api/account/new',
          headers: {jwt: $cookies.jwt},
          data: $scope.newAccount
        })
        .success(function() {
          var temp = $scope.newAccount;
          $scope.info.accounts.push(temp);
          $scope.adding = false;
          $scope.newAccount = {};
        });
      };

      $scope.editAccount = function(account) {
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

      $scope.deleteAccount = function(account) {
        $http({
          method: 'DELETE',
          url: '/api/account/remove' + account._id,
          headers: {jwt: $cookies.jwt}
        })
        .success(function() {
          $scope.info.accounts.splice($scope.info.accounts.indexOf(account), 1);
        });
      };
    }]);
};
