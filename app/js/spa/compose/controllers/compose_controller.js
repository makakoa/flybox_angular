'use strict';

module.exports = function(app) {
  app.controller('ComposeCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
    function($scope, $http, $base64, $cookies, $location) {
      $scope.newBox = {};
      $scope.newBox.members = [];

      $scope.send = function() {
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
        return $location.path('/');
      };

      $scope.checkAddress = function(recipient) {
        $http({
          method: 'POST',
          url: '/api/user/check',
          headers: {jwt: $cookies.jwt},
          data: recipient
        })
        .success(function(data) {
          recipient.isUser = data.isUser;
          if (data.isUser) recipient.name = data.name;
          $scope.newBox.members.push(recipient);
        });
      };

      $scope.checkIfSpace = function(event) {
        if (event === 32) {
          if ($scope.recipient.email === '') return;
          var temp = $scope.recipient.email;
          $scope.recipient.email = '';
          $scope.checkAddress({email: temp});
        }
      };
    }]);
};
