'use strict';

module.exports = function(app) {
  app.controller('InboxCtrl', ['$scope', '$http', '$base64', '$cookies', '$location',
    function($scope, $http, $base64, $cookies, $location) {
      if (!$cookies.jwt) {
        console.log('redirecting');
        $location.path('/');
      }

      $scope.boxDetail = {
        title: 'TITLE!',
        date: 'today',
        members: ['cam', 'charles'],
        subject: 'subject',
        body: 'This is the body of the email'
      };

      $scope.index = function() {
        $http({
          method: 'GET',
          url: '/api/boxes',
          headers: {
            jwt: $cookies.jwt
          }
        })
          .success(function(data) {
            $scope.user = data.user;
            $scope.current = data.current;
            $scope.accounts = data.accounts;
            $scope.boxes = data.inbox;
            $scope.getBoxDetail($scope.boxes[0].boxKey);
          })
          .error(function(err) {
            console.log(err);
          });
      };

      $scope.index();

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
          $scope.index();
        });
      };

      $scope.goToBox = function(boxKey) {
        return $location.path('/box/' + boxKey);
      };

      $scope.logOut = function() {
        delete $cookies.jwt;
        return $location.path('/');
      };

      $scope.highlightThis = function() {
        console.log('CLICKED');
        /*
        * Do this later:
        * http://stackoverflow.com/questions/17928487/angular-js-how-to-change-an-elements-css-class-on-click-and-to-remove-all-others
        */
      };

      $scope.getBoxDetail = function(boxKey) {
        $http({
          method: 'GET',
          url: '/api/boxes/' + boxKey,
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          $scope.boxDetail = {
            title: data.box.subject,
            date: data.box.date,
            members: data.box.members,
            subject: 'subject2',
            body: data.box.thread[0].content
          };
        }); // TODO: add error catch
      };

      //console.log($scope.boxes[0]);
    }]);
};
