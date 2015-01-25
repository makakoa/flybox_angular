'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Compose Controller', function() {
  var $controllerConstructor;
  var $httpBackend;
  var $scope;
  var $cookies = {jwt: 'hash'};
  var testBox = {
        subject: 'testSubject',
        date: '1/2/13',
        members: [],
        thread: []
  };

  beforeEach(angular.mock.module('flyboxApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controllerConstructor = $controller;
  }));

  it('should be able to create a controller', function() {
    var composeController = $controllerConstructor('ComposeCtrl', {$scope: $scope, $cookies: $cookies});
    expect(typeof composeController).toBe('object');
  });

  describe('compose functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('ComposeCtrl', {$scope: $scope, $cookies: $cookies});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should send a box', function() {
      $httpBackend.expectPOST('/api/boxes').respond(200);

      $scope.newBox = testBox;
      $scope.send();

      $httpBackend.flush();
    });
  });
});