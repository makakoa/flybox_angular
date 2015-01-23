'use strict';

module.exports = function(app) {
  app.controller('BoxCtrl', ['$scope', '$http', '$base64', '$cookies', '$location', 'socket',
    function($scope, $http, $base64, $cookies, $location, socket) {

      $scope.getBox = function() {
        console.log('GET box: ' + $scope.selectedBox);
        $http({
          method: 'GET',
          url: '/api/boxes/' + $scope.selectedBox,
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          console.log('Box retrieved');
          $scope.box = data.box;
          $scope.posts = data.box.thread;
          socket.emit('init', {
            token: $cookies.jwt,
            room: $scope.selectedBox
          });
        });
      };

      $scope.addMember = function(newMember) {
        $http({
          method: 'POST',
          url: '/api/boxes/' + $scope.selectedBox,
          headers: {jwt: $cookies.jwt},
          data: newMember
        })
        .success(function() {
          $scope.newMember = {};
        });
      };

      $scope.leaveBox = function() {
        $http({
          method: 'DELETE',
          url: '/api/boxes/' + $scope.selectedBox,
          headers: {jwt: $cookies.jwt}
        })
        .success(function() {
          return $location.path('/');
        });
      };

      socket.on('read', function(data) {
        $scope.box.members.forEach(function(member) {
          if (member.email === data.by) member.unread = 0;
        });
      });

      socket.on('send:post', function(post) {
        $scope.posts.push(post);
        $scope.box.members.forEach(function(member) {
          member.unread++;
          if (member.email === post.by) member.unread = 0;
        });
      });

      socket.on('edit:post', function() {
        $scope.index();
      });

      $scope.reply = function() {
        if ($scope.newPost.text === '') return;
        socket.emit('send:post', {
          content: $scope.newPost.content,
          by: $scope.username,
          box: $scope.selectedBox,
          sendEmail: $scope.sendEmail
        });
        var tempPost = $scope.newPost;
        tempPost.by = 'me';
        tempPost.date = Date.now();
        $scope.posts.push(tempPost);
        $scope.newPost = {};
        $scope.box.members.forEach(function(member) {
          member.unread++;
          if (member.email === $scope.username) member.unread = 0;
        });
      };

      $scope.edit = function(post) {
        socket.emit('edit:post', {
          _id: post._id,
          content: post.newContent,
          by: $scope.username
        });
        if (post.newContent) post.content = post.newContent;
        post.editing = false;
      };

      $scope.delete = function(post) {
        socket.emit('edit:post', {
          _id: post._id,
          delete: true
        });
        post.by = 'deleted';
        post.content = '';
      };

      $scope.checkIfEnter = function(event) {
        if (event === 13) {
          $scope.reply();
        }
      };
    }]);
};
