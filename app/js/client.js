'use strict';

require('angular/angular');
require('angular-route');
require('angular-cookies');
require('angular-base64');
window.io = require('socket.io-client/socket.io');
require('angular-socket-io');
require('angular-sanitize');

var app = angular.module('flyboxApp', ['ngRoute', 'ngCookies', 'base64', 'btford.socket-io', 'ngSanitize']);

require('./services/socket_service')(app);
require('./login/login')(app);
require('./guest/guest')(app);
require('./spa/spa')(app);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })
    .when('/n/', {
      templateUrl: 'templates/spa.html',
      controller: 'SpaCtrl'
    })
    .when('/landing/', {
      templateUrl: 'templates/landing.html'
    })
    .when('/guest/:boxKey/:guestKey', {
      templateUrl: 'templates/guest.html',
      controller: 'GuestCtrl'
    })
    .when('/spa/', {
      templateUrl: 'templates/inbox2.html',
      controller: 'InboxCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);
