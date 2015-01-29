'use strict';

process.env.MONGO_URL = 'mongodb://localhost/flybox_test';
var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);

require('../../server');
var expect = chai.expect;
var appUrl = 'http://localhost:3000';

describe('Email functions', function() {
  var jwtToken;

  before(function(done) {
    chai.request(appUrl)
    .get('/api/users')
    .auth('flyboxdev', 'pass')
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body).to.have.property('jwt');
      jwtToken = res.body.jwt;
      done();
    });
  });

  it('should be able to import emails', function(done) {
    this.timeout(10000);
    chai.request(appUrl)
    .post('/api/emails/import')
    .set({jwt: jwtToken})
    .send({index: 0})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('emails imported');
      done();
    });
  });
});