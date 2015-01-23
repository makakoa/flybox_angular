'use strict';

module.exports = function(app) {
  app.controller('InboxCtrl', ['$scope', '$http', '$base64', '$cookies',
    function($scope, $http, $base64, $cookies) {

      $scope.getInbox = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {jwt: $cookies.jwt}
        })
          .success(function(data) {
            $scope.boxes = data.inbox;
            $scope.selectedBox = $scope.boxes[$scope.boxes.length - 1].boxKey;
/*            $http({
              method: 'POST',
              url: '/api/emails/import/',
              headers: {jwt: $cookies.jwt},
              data: {index: $scope.user.current}
            })
            .success(function() {
              console.log('emails imported');
            });*/
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
