'use strict';

module.exports = function(app) {
  app.controller('InboxCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
    function($scope, $http, $base64, $cookies) {

      $scope.getInbox = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {jwt: $cookies.jwt}
        })
          .success(function(data) {
            $scope.user = data.user;
            $scope.current = data.current;
            $scope.accounts = data.accounts;
            $scope.boxes = data.inbox;
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

      $scope.getInbox();

      $scope.selectBox = function(boxKey) {
        $scope.selectedBox = boxKey;
        $scope.getBox();
      };
    }]);
};
