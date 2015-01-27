'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Spa Controller', function() {
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
    var spaController = $controllerConstructor('SpaCtrl', {$scope: $scope, $cookies: $cookies});
    expect(typeof spaController).toBe('object');
  });

  describe('spa functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('SpaCtrl', {$scope: $scope, $cookies: $cookies});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get user data', function() {
      $httpBackend.expectGET('/api/boxes').respond(200, {
        user: {name: 'flyboxtes'},
        current: 0,
        accounts: []
      });

      $scope.init();

      $httpBackend.flush();

      expect(typeof $scope.user).toBe('object');
      expect($scope.current).toBe(0);
      expect(Array.isArray($scope.accounts)).toBeTruthy();
    });
  });
});