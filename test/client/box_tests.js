'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Box Controller', function() {
  var $controllerConstructor;
  var $httpBackend;
  var $scope;
  var $cookies = {jwt: 'hash'};

  beforeEach(angular.mock.module('flyboxApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controllerConstructor = $controller;
  }));

  it('should be able to create a controller', function() {
    var boxController = $controllerConstructor('BoxCtrl', {$scope: $scope, $cookies: $cookies});
    expect(typeof boxController).toBe('object');
  });

  describe('box functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('BoxCtrl', {$scope: $scope, $cookies: $cookies});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get a box from the server', function() {
      $httpBackend.expectGET('/api/boxes/123').respond(200, {box: {
        subject: 'testSubject',
        date: '1/2/13',
        members: [],
        thread: []
      }});

      $scope.selectedBox = '123';
      $scope.getBox('123');

      $httpBackend.flush();

      expect(typeof $scope.box).toBe('object');
      expect(Array.isArray($scope.posts)).toBeTruthy();
    });
  });
});