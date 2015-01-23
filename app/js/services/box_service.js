'use strict';

module.exports = function(app) {
  var handleError = function(data) {
    console.log(data);
  };
  app.factory('BoxBackend', ['$http', '$cookies', function($http, $cookies) {
    return function() {
      return {
        getBox: function(boxKey) {
          return $http({
            method: 'GET',
            url: '/api/boxes/' + boxKey,
            headers: {jwt: $cookies.jwt}
          })
          .error(handleError);
        },

        addMember: function(boxKey, newMember) {
          return $http({
            method: 'POST',
            url: '/api/boxes/' + boxKey,
            headers: {jwt: $cookies.jwt},
            data: newMember
          });
        }
      };
    };
  }]);
};
