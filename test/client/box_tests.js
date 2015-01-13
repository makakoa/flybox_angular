'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('BoxController', function() {
  var $controllerConstructor;
  var $httpBackend;
  var $scope;

  beforeEach(angular.mock.module('flyboxApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controllerConstructor = $controller;
  }));

  it('should be able to create a controller', function() {
    var boxController = $controllerConstructor('BoxCtrl', {$scope: $scope});
    expect(typeof boxController).toBe('object');
  });
});