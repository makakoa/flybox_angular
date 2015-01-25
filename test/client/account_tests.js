'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Account Controller', function() {
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
    var accountController = $controllerConstructor('AccountCtrl', {$scope: $scope, $cookies: $cookies});
    expect(typeof accountController).toBe('object');
  });

  describe('account functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('AccountCtrl', {$scope: $scope, $cookies: $cookies});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should get account information', function() {
      $httpBackend.expectGET('/api/account/').respond(200, {
        email: 'flybox',
        password: 'awelrf',
        accounts: []
      });

      $scope.indexUser();

      $httpBackend.flush();

      expect(typeof $scope.info).toBe('object');
      expect($scope.username).toBe('flybox');
    });
  });
});