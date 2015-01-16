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

      $scope.add = function() {
        $http({
          method: 'POST',
          url: '/api/account/smtp',
          headers: {jwt: $cookies.jwt},
          data: $scope.newSmtp
        })
        .success(function() {
          var temp = $scope.newSmtp;
          $scope.user.smtps.push(temp);
          $scope.adding = false;
          $scope.newSmtp = {};
        });
      };

      $scope.edit = function(smtp) {
        console.log(smtp);
        $http({
          method: 'PUT',
          url: '/api/account/smtp',
          headers: {jwt: $cookies.jwt},
          data: smtp
        })
        .success(function() {
          smtp.editing = false;
        });
      };

      $scope.delete = function(smtp) {
        $http({
          method: 'DELETE',
          url: '/api/account/smtp/' + smtp._id,
          headers: {jwt: $cookies.jwt}
        })
        .success(function() {
          $scope.user.smtps.splice($scope.user.smtps.indexOf(smtp), 1);
        });
      };

      $scope.logOut = function() {
        delete $cookies.jwt;
        return $location.path('/');
      };
    }]);
};
