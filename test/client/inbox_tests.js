'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Inbox Controller', function() {
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
    var inboxController = $controllerConstructor('InboxCtrl', {$scope: $scope, $cookies: $cookies});
    expect(typeof inboxController).toBe('object');
  });

  describe('Inbox functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('InboxCtrl', {$scope: $scope, $cookies: $cookies});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get an inbox', function() {
      $httpBackend.expectGET('/api/boxes').respond(200, {
        inbox: [{
          date: '1/2/13',
          subject: 'testing',
          thread: [],
          boxKey: 123
        }]
      });

      $scope.getInbox();

      $httpBackend.flush();

      expect(Array.isArray($scope.boxes)).toBeTruthy();
      expect(typeof $scope.boxes[0]).toBe('object');
    });
  });
});
