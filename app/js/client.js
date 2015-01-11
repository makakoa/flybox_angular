'use strict';

require('angular/angular');
require('angular-route');
require('angular-cookies');
require('angular-base64');

var app = angular.module('flyboxApp', ['ngRoute', 'ngCookies', 'base64']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'templates/login.html'
  })
  .otherwise({
    redirectTo: '/'
  });
}]);