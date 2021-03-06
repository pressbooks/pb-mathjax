const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('Testing the /latex route', function() {

  it('Should return type of image as svg', function() {
    return request(app).
        get('/latex?latex=x%5En%20%2B%20y%5En%20%3D%20z%5En&fg=000000&svg=1').
        then(function(response) {
          expect(response.type).to.contain('image/svg+xml');
        });
  });

  it('Should return type of image as png', function() {
    return request(app).
        get('/latex?latex=x%5En%20%2B%20y%5En%20%3D%20z%5En&fg=000000&svg=0').
        then(function(response) {
          expect(response.type).to.contain('image/png');
        });
  });

  it('Should return type of image as png', function() {
    return request(app).
        get('/latex?latex=x%5En%20%2B%20y%5En%20%3D%20z%5En&fg=000000').
        then(function(response) {
          expect(response.type).to.contain('image/png');
        });
  });

  it('Bad LaTex should return error status', function() {
    return request(app).
        get('/latex?latex=%5CLaTeX%26s%3DX&svg=1').
        then(function(response) {
          expect(response.type).to.contain('image/png');
          expect(response.get('pb-mathjax-error')).to.equal('Formula does not parse');
        });
  });

});