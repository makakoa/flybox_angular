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

      $scope.add = function() {
        if (!$scope.newSmtp.host || !$scope.newSmtp.port || !$scope.newSmtp.username || !$scope.newSmtp.password)
          return console.log('fill in all fields');
        $http({
          method: 'POST',
          url: '/account/smtp',
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
        $http({
          method: 'PUT',
          url: '/account/smtp',
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
          url: '/account/smtp/' + smtp._id,
          headers: {jwt: $cookies.jwt}
        })
        .success(function() {
          $scope.user.smtps.splice($scope.user.smtps.indexOf(smtp), 1);
        });
      };
    }]);
};
