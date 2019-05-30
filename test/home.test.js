const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('Unit testing the /home route', function() {

  it('should return OK status', function() {
    return request(app).get('/').then(function(response) {
      assert.equal(response.status, 200);
    });
  });

  it('should return message on rendering', function() {
    return request(app).get('/').then(function(response) {
      expect(response.text).to.contain('Welcome to PB MathJax');
    });
  });

});

describe('Testing the /latex route', function(){
    
  it('Should return type of image as svg', function() {
    return request(app).get('/latex?latex=x%5En%20%2B%20y%5En%20%3D%20z%5En&bg=ffffff&fg=000000&s=3&zoom=1&svg=1').then(function(response) {
      expect(response.type).to.contain('image/svg+xml');
    });
  })
    
  it('Should return type of image as png', function() {
      return request(app).get('/latex?latex=x%5En%20%2B%20y%5En%20%3D%20z%5En&bg=ffffff&fg=000000&s=3&zoom=1').then(function(response) {
        expect(response.type).to.contain('image/png');
      });
    })

  it('Bad LaTex should return error status', function() {
    return request(app).get('/latex?latex=thisinvalidurl').then(function(response) {
      assert.equal(response.status, 500);
    });
  })
  
});