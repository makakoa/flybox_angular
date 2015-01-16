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
  var smtpId;

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

  it('should add smtp info using service', function(done) {
    chai.request(appUrl)
    .post('/api/account/smtp')
    .set({jwt: jwtToken})
    .send({
      service: 'gmail',
      auth: {
        user: 'flybox4real@gmail.com',
        pass: 'flyboxme'
      }
    })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('added');
      done();
    });
  });
  
  it('should add a second smtp using smtp info', function(done) {
    chai.request(appUrl)
    .post('/api/account/smtp')
    .set({jwt: jwtToken})
    .send({
      auth: {
        user: 'flyboxnotreal@gmail.com',
        pass: 'incorrect'
      },
      host: 'smtp.gmail.com',
      port: 465,
      secureConnection: true
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
      expect(res.body.smtps.length).to.eql(2);
      smtpId = res.body.smtps[1]._id;
      done();
    });
  });

  it('should be able to edit smtp', function(done) {
    chai.request(appUrl)
    .put('/api/account/smtp')
    .set({jwt: jwtToken})
    .send({
      _id: smtpId,
      auth: {
        user: 'right@right.com',
        pass: 'correct'
      },
      service: 'notgmail'
    })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('saved');
      done();
    });
  });

  it('should delete an smtp', function(done) {
    chai.request(appUrl)
    .delete('/api/account/smtp/' + smtpId)
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('deleted');
      done();
    });
  });
  
  if('should set current smtp', function(done) {
    chai.request(appUrl)
    .put('/api/account/current')
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body).to.have.property('set');
      done();
    });
  });
});
