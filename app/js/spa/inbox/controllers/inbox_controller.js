'use strict';

module.exports = function(app) {
  app.controller('InboxCtrl', ['$rootScope', '$http', '$base64', '$cookies',
    function($rootScope, $http, $base64, $cookies) {
      var $scope = $rootScope;

      $scope.getInbox = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {jwt: $cookies.jwt}
        })
          .success(function(data) {
            $scope.boxes = data.inbox;
            $scope.selectBox($scope.boxes[$scope.boxes.length - 1].boxKey);
          })
          .error(function(err) {
            console.log(err);
          });
      };

      $scope.selectBox = function(boxKey) {
        $scope.selectedBox = boxKey;
        $scope.getBox();
      };
    }]);
};
