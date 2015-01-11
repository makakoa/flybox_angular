'use strict';

process.env.MONGO_URL = 'mongodb://localhost/flybox_test';
var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);

require('../../server');
var expect = chai.expect;
var appUrl = 'http://localhost:3000';

describe('box routes', function() {
  var jwtToken;
  var boxKey;

  before(function(done) {
    chai.request(appUrl)
    .post('/api/users')
    .send({email: 'flybox4real@gmail.com', password: 'flyboxme'})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body).to.have.property('jwt');
      jwtToken = res.body.jwt;
      done();
    });
  });

  it('should make a box', function(done) {
    chai.request(appUrl)
    .post('/api/boxes')
    .set({jwt: jwtToken})
    .send({post: {
            by: 'flybox4real',
            content: 'Hey, you there!'
           },
           subject: 'Test greetings',
           members: ['someguy', 'andanother']
          })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('sent!');
      done();
    });
  });

  it('should get an index of boxes for a user', function(done) {
    chai.request(appUrl)
    .get('/api/boxes')
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(Array.isArray(res.body)).to.be.true;
      boxKey = res.body[0].boxKey;
      done();
    });
  });

  it('should get a single box', function(done) {
    chai.request(appUrl)
    .get('/api/boxes/' + boxKey)
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.thread[0].by).to.eql('flybox4real');
      done();
    });
  });
});
