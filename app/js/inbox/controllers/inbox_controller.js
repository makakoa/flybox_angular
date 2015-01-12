'use strict';

module.exports = function(app) {
  app.controller('InboxCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
      function($scope, $http, $base64, $cookies, $location) {
      if (!$cookies.jwt) {
        console.log('redirecting');
        $location.path('/');
      }

      $scope.menu = true;
      $scope.composing = true;

      $scope.logOut = function() {
        delete $cookies.jwt;
        delete $cookies.smtpSet;
        return $location.path('/');
      };

      $scope.settings = function() {
        return $location.path('/settings');
      };

      $scope.goToInbox = function() {
        return $location.path('/inbox');
      };

      var getBoxes = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {
            jwt: $cookies.jwt
          }
        })
          .success(function(data) {
            $scope.boxes = data;
            console.log('got them Boxes', data);
          })
          .error(function(data) {
            console.log('err from getBoxes', data);
            $scope.logOut();
          });
      };
      getBoxes();

      $scope.goToBox = function(boxKey, creatorKey) {
        return $location.path('/n/' + boxKey + '/' + creatorKey);
      };
    }]);
};
