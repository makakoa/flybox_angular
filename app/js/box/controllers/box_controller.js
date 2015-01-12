'use strict';

module.exports = function(app) {
  app.controller('BoxCtrl', ['$scope', '$http', '$base64', '$cookies', '$location', '$routeParams', 'socket',
    function($scope, $http, $base64, $cookies, $location, $routeParams, socket) {
      var boxKey = $routeParams.boxId;
      var userId = $routeParams.userId;
      if (!userId) userId = '';
      var username;

      $scope.index = function() {
        $http({
          method: 'GET',
          url: '/api/boxes/' + boxKey,
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          $scope.box = {
            subject: data.subject,
            date: data.date,
            members: data.members
          };
          $scope.posts = data.thread;
        }); // TODO: add error catch
      };

      $scope.index();

      socket.on('init', function(data) {
        username = data.name;
        console.log('connected');
      });

      socket.on('send:post', function(post) {
        $scope.posts.push(post);
      });

      $scope.reply = function() {
        if ($scope.newPost.text === '') return;
        socket.emit('send:post', {
          content: $scope.newPost.content,
          by: username,
          box: boxKey
        });
        var tempPost = $scope.newPost;
        tempPost.by = 'me';
        tempPost.date = Date.now();
        $scope.posts.push(tempPost);
        $scope.newPost = {};
      };

      $scope.checkIfEnter = function(event) {
        if (event === 13) {
          $scope.reply();
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
