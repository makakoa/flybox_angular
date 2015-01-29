'use strict';

process.env.MONGO_URL = 'mongodb://localhost/flybox_test';
var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);

require('../../server');
var expect = chai.expect;
var appUrl = 'http://localhost:3000';

describe('Box routes', function() {
  var jwtToken;
  var jwtToken2;
  var boxKey;

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

  before(function(done) {
    chai.request('http://localhost:3000')
    .post('/api/users')
    .send({email: 'flyboxdev2', password: 'pass'})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body).to.have.property('jwt');
      jwtToken2 = res.body.jwt;
      done();
    });
  });

  it('should be able to check for another user', function(done) {
    chai.request('http://localhost:3000')
    .post('/api/user/check')
    .send({email: 'flybox4real@gmail.com'})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.isUser).to.eql(true);
      done();
    });
  });

  it('should make a box', function(done) {
    chai.request(appUrl)
    .post('/api/boxes')
    .set({jwt: jwtToken})
    .send({post: {
            text: 'here is some text!',
            html: '<h2>here is some html!</h2>'
           },
           subject: 'Test greetings',
           members: [{email: 'someguy', isUser: false, link: true},
                     {email: 'andanother', isUser: false}],
           sendEmail: true
          })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('sent!');
      done();
    });
  });

  it('should get an inbox for a user', function(done) {
    chai.request(appUrl)
    .get('/api/boxes')
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(Array.isArray(res.body.inbox)).to.eql(true);
      boxKey = res.body.inbox[0].boxKey;
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

  it('should get a single box', function(done) {
    chai.request(appUrl)
    .get('/api/boxes/' + boxKey)
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.box.thread[0].by).to.eql('flybox4real@gmail.com');
      done();
    });
  });
  
  it('should be able to add a member to a box', function(done) {
    chai.request(appUrl)
    .post('/api/boxes/' + boxKey)
    .set({jwt: jwtToken})
    .send({email: 'newGuy'})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('member added');
      done();
    });
  });
});
