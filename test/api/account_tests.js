'use strict';

process.env.MONGO_URL = 'mongodb://localhost/flybox_test';
var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);

require('../../server');
var expect = chai.expect;
var appUrl = 'http://localhost:3000';

describe('Account Settings', function() {
  var jwtToken;
  var accountId;

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

  it('should get a users information', function(done) {
    chai.request(appUrl)
    .get('/api/account')
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.email).to.eql('flyboxdev');
      done();
    });
  });

  it('should set a display name', function(done) {
    chai.request(appUrl)
    .put('/api/account/name')
    .set({jwt: jwtToken})
    .send({newName: 'Sir Fly'})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('saved');
      done();
    });
  });

  it('should add account info using service', function(done) {
    chai.request(appUrl)
    .post('/api/account/new')
    .set({jwt: jwtToken})
    .send({
      service: 'gmail',
      email: 'flybox4real@gmail.com',
      password: 'flyboxme'
    })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('added');
      done();
    });
  });

  it('should add a second account using smtp and imap info', function(done) {
    chai.request(appUrl)
    .post('/api/account/new')
    .set({jwt: jwtToken})
    .send({
      email: 'flyboxnotreal@gmail.com',
      password: 'incorrect',
      smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true
      },
      imap: {
        host: 'imap.gmail.com',
        port: 993,
        tls: true
      }
    })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('added');
      done();
    });
  });

  it('should update info and have set current', function(done) {
    chai.request(appUrl)
    .get('/api/account')
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.email).to.eql('flyboxdev');
      expect(res.body.displayName).to.eql('Sir Fly');
      expect(res.body.current).to.eql(1);
      expect(res.body.accounts.length).to.eql(2);
      accountId = res.body.accounts[1]._id;
      done();
    });
  });

  it('should be able to edit account', function(done) {
    chai.request(appUrl)
    .put('/api/account/')
    .set({jwt: jwtToken})
    .send({
      _id: accountId,
      email: 'right@right.com',
      password: 'correct',
      service: 'notgmail'
    })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('account updated');
      done();
    });
  });

  it('should delete an account', function(done) {
    chai.request(appUrl)
    .delete('/api/account/remove/' + accountId)
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('deleted');
      done();
    });
  });

  it('should set current account', function(done) {
    chai.request(appUrl)
    .put('/api/account/current')
    .set({jwt: jwtToken})
    .send({
      number: 0
    })
    .end(function(err, res) {
      expect(err).to.eql(null);
      //expect(res.body).to.have.property('set');
      done();
    });
  });
});
