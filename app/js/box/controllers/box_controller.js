'use strict';

module.exports = function(app) {
  app.controller('BoxCtrl', ['$scope', '$http', '$base64', '$cookies', '$location', '$routeParams', 'socket',
    function($scope, $http, $base64, $cookies, $location, $routeParams, socket) {
      var boxId = 'sampleBoxKey' || $routeParams.boxId;
      var userId = 'sampleUserKey' || $routeParams.userId;
      (function() {
        $http.get('/api/n/' + boxId + '/' + userId).success(function(data) {
          $scope.box = {
            subject: data.subject,
            date: data.date,
            members: data.members,
            thread: data.thread
          };
        }); // TODO: add error catch
      })();

      socket.on('init', function(data) {
        $scope.name = data.name;
        $scope.users = data.users;
      });

      socket.on('send:post', function(post) {
        $scope.posts.push(post);
      });

      $scope.makeComment = function() {
        if ($scope.newPost.text === '') return;
        socket.emit('send:post', {
          message: $scope.newPost.text,
          boxKey: boxId,
          userId: userId
        });
        var tempPost = $scope.newPost;
        tempPost.author = 'me';
        tempPost.time = Date.now();
        $scope.posts.push(tempPost);
        $scope.newPost = {};
      };

      $scope.checkIfEnter = function(event) {
        if (event === 13) {
          $scope.makeComment();
        }
      };

      $scope.logOut = function() {
        delete $cookies.jwt;
        return $location.path('/');
      };

      $scope.settings = function() {
        return $location.path('/settings');
      };

      $scope.goToInbox = function() {
        return $location.path('/inbox');
      };

      $scope.doneEditing = function() {
        $scope.textBody.editing = false;
        $scope.original.post = $scope.textBody.text;
        //TODO update db with socket
      };
    }]);
};
