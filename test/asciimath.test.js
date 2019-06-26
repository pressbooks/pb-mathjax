const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('Testing the /asciimath route', function() {

  it('Should return type of image as svg', function() {
    return request(app).
        get('/asciimath?asciimath=x%5En%20%2B%20y%5En%20%3D%20z%5En&fg=000000&svg=1').
        then(function(response) {
          expect(response.type).to.contain('image/svg+xml');
        });
  });

  it('Should return type of image as png', function() {
    return request(app).
        get('/asciimath?asciimath=x%5En%20%2B%20y%5En%20%3D%20z%5En&fg=000000&svg=0').
        then(function(response) {
          expect(response.type).to.contain('image/png');
        });
  });

  it('Should return type of image as png', function() {
    return request(app).
        get('/asciimath?asciimath=x%5En%20%2B%20y%5En%20%3D%20z%5En&fg=000000').
        then(function(response) {
          expect(response.type).to.contain('image/png');
        });
  });

  it('Should exit from a crash', function() {
    // https://github.com/mathjax/MathJax-node/issues/441
    // https://github.com/mathjax/MathJax-node/pull/442
    this.timeout(8000);
    return request(app).
        get('asciimath?asciimath=%5Cbegin%7Bequation%2A%7D%20%20A%20%3D%20%5Cleft%5B%20%5Cbegin%7Barray%7D%7Bcccc%7D%20%20a_%7B11%7D%20%26%20a_%7B12%7D%20%26%20a_%7B13%7D%20%26%20a_%7B14%7D%20%5C%5C%20%20a_%7B21%7D%20%26%20a_%7B22%7D%20%26%20a_%7B23%7D%20%26%20a_%7B24%7D%20%5C%5C%20%20a_%7B31%7D%20%26%20a_%7B32%7D%20%26%20a_%7B33%7D%20%26%20a_%7B34%7D%20%20%5Cend%7Barray%7D%20%5Cright%5D%20%20%5Cend%7Bequation%2A%7D&fg=561442').
        catch((err) => {
          expect(err.toString()).to.contain('ECONNREFUSED');
        });
  });

});