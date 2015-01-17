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
          })
          .error(function(err) {
            console.log(err);
          });
      };

      $scope.index();

      $scope.import = function() {
        $http({
          method: 'GET',
          url: '/api/emails/import',
          headers: {
            jwt: $cookies.jwt
          }
        })
        .success(function() {
          $scope.index();
        });
      };

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

      $scope.getBoxDetail = function(boxKey) {
        $http({
          method: 'GET',
          url: '/api/boxes/' + boxKey,
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          $scope.boxDetail = {
            title: data.box.subject,
            date: 'today2',
            members: data.box.members,
            subject: 'subject2',
            body: data.box.thread[0].content
          };
        }); // TODO: add error catch
      };
    }]);
};
