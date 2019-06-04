const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('Testing the /asciimath route', function() {

  it('Should return type of image as svg', function() {
    return request(app).
        get('/asciimath?asciimath=x%5En%20%2B%20y%5En%20%3D%20z%5En&bg=ffffff&fg=000000&s=3&zoom=1&svg=1').
        then(function(response) {
          expect(response.type).to.contain('image/svg+xml');
        });
  });

  it('Should return type of image as png', function() {
    return request(app).
        get('/asciimath?asciimath=x%5En%20%2B%20y%5En%20%3D%20z%5En&bg=ffffff&fg=000000&s=3&zoom=1').
        then(function(response) {
          expect(response.type).to.contain('image/png');
        });
  });

  // TODO: Bad AsciiMath? Haven't been able to crash it like LaTeX does

});