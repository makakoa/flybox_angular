'use strict';

process.env.MONGO_URL = 'mongodb://localhost/flybox_test';
var chai = require('chai');
var chaihttp = require('chai-http');
chai.use(chaihttp);

require('../../server');
var expect = chai.expect;
var appUrl = 'http://localhost:3000';

var io = require('socket.io-client');
var socketUrl = 'http://0.0.0.0:3000';
var options ={
  transports: ['websocket'],
  'force new connection': true
};

describe('Socket Routes', function() {
  var jwtToken;
  var jwtToken2;
  var boxKey;
  var postID;
  var client1;
  var client2;

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
    chai.request(appUrl)
    .get('/api/users')
    .auth('flyboxdev2', 'pass')
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body).to.have.property('jwt');
      jwtToken2 = res.body.jwt;
      done();
    });
  });
  
  before(function(done) {
    chai.request(appUrl)
    .post('/api/boxes')
    .set({jwt: jwtToken})
    .send({post: {
            text: 'Socket test text!',
            html: '<h2>Socket test html!</h2>'
           },
           subject: 'Socket Test',
           members: [{email: 'flyboxdev2', isUser: true}],
           sendEmail: false
          })
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.msg).to.eql('sent!');
      done();
    });
  });

  before(function(done) {
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

  before(function(done) {
    chai.request(appUrl)
    .get('/api/boxes/' + boxKey)
    .set({jwt: jwtToken})
    .end(function(err, res) {
      expect(err).to.eql(null);
      expect(res.body.box.thread[0].by).to.eql('flybox4real@gmail.com');
      postID = res.body.box.thread[0]._id;
      done();
    });
  });

  it('should be able to log in user 1', function(done) {
    client1 = io.connect(socketUrl, options);
    client1.emit('log:in', {
      token: jwtToken
    });
    client1.on('connected', function() {
      done();
    });
  });

  it('should be able to log in user 2', function(done) {
    client2 = io.connect(socketUrl, options);
    client2.emit('log:in', {
      token: jwtToken2
    });
    client2.on('connected', function() {
      done();
    });
  });

  it('should be able to add a user to a box', function() {
    client1.emit('join:box', {
      room: boxKey
    });
    client1.on('update:room', function(data) {
      expect(typeof data.online).to.eql('object');
    });
  });

  it('should be able to update when another user joins', function() {
    client2.emit('join:box', {
      room: boxKey
    });
    client1.on('update:room', function(data) {
      expect(typeof data.online).to.eql('object');
    });
  });
  
  it('should be able to send a post', function() {
    client1.emit('send:post', {
      content: 'Test post text content',
      html: '<h1>Test post html content</h1>'
    });
    client2.on('send:post', function(data) {
      expect(data.content).to.eql('Test post text content');
      expect(data.html).to.eql('<h1>Test post html content</h1>');
      expect(data.by).to.eql('flybox4real@gmail.com');
      expect(typeof data.date).to.eql('number');
    });
  });
  
  it('should send a notification of a post', function() {
    client2.on('notification', function(data) {
      expect(typeof data.msg).to.eql('String');
    });
  });

  it('should be able to edit a post', function() {
    client1.emit('edit:post', {
      _id: postID,
      content: 'Edited through socket',
      html: '<h4>edited through socket</h4>'
    });
    client2.on('edit:post', function(post) {
      expect(post.content).to.eql('Edited through socket');
    });
  });

  it('should be able to send a read notice', function() {
    client2.emit('read');
    client1.on('read', function(data) {
      expect(data.by).to.eql('flyboxdev2');
    });
  });

  it('should update a user when another user leaves a room', function() {
    client2.emit('join:box', {
      room: '123'
    });
    client1.on('update:room', function(data) {
      expect(typeof data.online).to.eql('object');
    });
  });
});
