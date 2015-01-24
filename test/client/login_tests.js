'use strict';

require('../../app/js/client');
require('angular-mocks');

describe('Login Controller', function() {
  var $controllerConstructor;
  var $httpBackend;
  var $scope;
  var $cookies = {};
  var testUser = {email: 'flybox', password: 'pass', passwordConfirmation: 'pass'};

  beforeEach(angular.mock.module('flyboxApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controllerConstructor = $controller;
  }));

  it('should be able to create a controller', function() {
    var loginController = $controllerConstructor('LoginCtrl', {$scope: $scope, $cookies: $cookies});
    expect(typeof loginController).toBe('object');
  });

  describe('Log-in functions', function() {
    beforeEach(angular.mock.inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $controllerConstructor('LoginCtrl', {$scope: $scope, $cookies: $cookies});
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should create a user', function() {
      $httpBackend.expectPOST('/api/users').respond(200, {
        jwt: 'hash'
      });

      $scope.newUser = testUser;
      $scope.signUp();

      $httpBackend.flush();

      expect($cookies.jwt).toBe('hash');
    });

    it('should log in a user', function() {
      $httpBackend.expectGET('/api/users').respond(200, {
        jwt: 'hash'
      });

      $scope.user = testUser;
      $scope.logIn();
      
      $httpBackend.flush();

      expect($cookies.jwt).toBe('hash');
    });
  });
});
