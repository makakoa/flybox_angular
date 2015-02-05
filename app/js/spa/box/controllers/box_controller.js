'use strict';

module.exports = function(app) {
  app.controller('BoxCtrl', ['$scope', '$http', '$cookies', '$location', 'socket',
    function($scope, $http, $cookies, $location, socket) {
      $scope.newPost = {};

      $scope.getBox = function(boxKey) {
        console.log('GET box: ' + boxKey);
        $http({
          method: 'GET',
          url: '/api/boxes/' + boxKey,
          headers: {jwt: $cookies.jwt}
        })
        .success(function(data) {
          console.log('fly[]: Box retrieved');
          $scope.box = data.box;
          $scope.posts = data.box.thread;
          socket.emit('join:box', {
            room: boxKey
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

      $scope.$on('box:selected', function(ev, boxKey) {
        $scope.selectedBox = boxKey;
        $scope.getBox(boxKey);
      });

      socket.addOn('update:room', function(data) {
        console.log('fly[]: updating room');
        $scope.online = data.online;
      });

      socket.addOn('read', function(data) {
        console.log('fly[]: updating reads');
        $scope.box.members.forEach(function(member) {
          if (member.email === data.by) member.unread = 0;
        });
      });

      socket.addOn('notification', function(data) {
        console.log('fly[]: notification received');
        console.log(data.msg);
      });

      socket.addOn('send:post', function(post) {
        console.log('fly[]: post received');
        $scope.posts.push(post);
        $scope.box.members.forEach(function(member) {
          member.unread++;
          if (member.email === post.by) member.unread = 0;
        });
      });

      socket.addOn('edit:post', function() {
        console.log('fly[]: updating post');
        $scope.getBox();
      });

      $scope.reply = function() {
        if ($scope.newPost.html === '') return;
        socket.emit('send:post', {
          content: $scope.newPost.content,
          html: $scope.newPost.html,
          by: $scope.username,
          box: $scope.selectedBox,
          sendEmail: $scope.sendEmail
        });
        var tempPost = $scope.newPost;
        tempPost.by = $scope.current;
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
          html: post.html,
          by: $scope.current
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
        post.html = '';
      };

      $scope.checkIfEnter = function(event) {
        if (event === 13) {
          $scope.reply();
        }
      };

    }]);
};
