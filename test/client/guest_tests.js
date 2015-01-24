'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Guest Controller', function() {
  var $controllerConstructor;
  var $httpBackend;
  var $scope;
  var $routeParams = {boxKey: 123, guestKey: 456};

  beforeEach(angular.mock.module('flyboxApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controllerConstructor = $controller;
  }));

  it('should be able to create a controller', function() {
    var guestController = $controllerConstructor('GuestCtrl', {$scope: $scope, $routeParams: $routeParams});
    expect(typeof guestController).toBe('object');
  });

  describe('Guest box functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('GuestCtrl', {$scope: $scope, $routeParams: $routeParams});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get a box', function() {
      $httpBackend.expectGET('/api/box/guest/123/456').respond(200, {
        user: {name: 'flybox'},
        box: {
          boxKey: 123,
          members: [],
          thread: []
        }
      });

      $scope.loadBox();

      $httpBackend.flush();

      expect(typeof $scope.box).toBe('object');
      expect(typeof $scope.user).toBe('object');
      expect(Array.isArray($scope.posts)).toBeTruthy();
    });
  });
});
