'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Inbox Controller', function() {
  var $controllerConstructor;
  var $httpBackend;
  var $scope;

  beforeEach(angular.mock.module('flyboxApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controllerConstructor = $controller;
  }));

  it('should be able to create a controller', function() {
    var boxController = $controllerConstructor('InboxCtrl', {$scope: $scope});
    expect(typeof boxController).toBe('object');
  });

  describe('Inbox functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('InboxCtrl', {$scope: $scope});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get a box from the server', function() {
      $httpBackend.expectGET('/api/boxes').respond(200, [{
        email: 'testSubject',
        date: '1/2/13',
        subject: 'testing',
        boxKey: 123
      }]);
      $httpBackend.flush();
      expect(typeof $scope.boxes[0]).toBe('object');
      expect($scope.boxes.lenth).toBe(1);
    });
  });
});
