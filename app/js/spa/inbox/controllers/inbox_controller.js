'use strict';

module.exports = function(app) {
  app.controller('InboxCtrl', ['$scope', '$http', '$base64', '$cookies', 'socket',
    function($scope, $http, $base64, $cookies, socket) {

      $scope.getInbox = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {jwt: $cookies.jwt}
        })
          .success(function(data) {
            if (data.inbox.length < 1) return;
            $scope.boxes = data.inbox;
            $scope.selectBox($scope.boxes[$scope.boxes.length - 1].boxKey);
            socket.emit('update:account', {
              token: $cookies.jwt
            });
          })
          .error(function(err) {
            console.log(err);
          });
      };

      $scope.selectBox = function(boxKey) {
        if ($scope.selectedBox == boxKey) return;
        $scope.selectedBox = boxKey;
        $scope.$broadcast('box:selected', $scope.selectedBox);
      };

      $scope.$on('update:inbox', function() {
        $scope.getInbox();
      });
    }]);
};
