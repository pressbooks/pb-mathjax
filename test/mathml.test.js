const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('Testing the /mathml route', function() {

  it('Should return type of image as svg', function() {
    return request(app).
        get('/mathml?mathml=%3Cmath%3E%3Cmsup%3E%3Cmi%3Ee%3C%2Fmi%3E%3Cmrow%3E%3Cmi%3Ei%3C%2Fmi%3E%3Cmi%3E%26%23x03C0%3B%3C%2Fmi%3E%3C%2Fmrow%3E%3C%2Fmsup%3E%3Cmo%3E%2B%3C%2Fmo%3E%3Cmn%3E1%3C%2Fmn%3E%3Cmo%3E%3D%3C%2Fmo%3E%3Cmn%3E0%3C%2Fmn%3E%3C%2Fmath%3E&fg=000000&svg=1').
        then(function(response) {
          expect(response.type).to.contain('image/svg+xml');
        });
  });

  it('Should return type of image as png', function() {
    return request(app).
        get('/mathml?mathml=%3Cmath%3E%3Cmsup%3E%3Cmi%3Ee%3C%2Fmi%3E%3Cmrow%3E%3Cmi%3Ei%3C%2Fmi%3E%3Cmi%3E%26%23x03C0%3B%3C%2Fmi%3E%3C%2Fmrow%3E%3C%2Fmsup%3E%3Cmo%3E%2B%3C%2Fmo%3E%3Cmn%3E1%3C%2Fmn%3E%3Cmo%3E%3D%3C%2Fmo%3E%3Cmn%3E0%3C%2Fmn%3E%3C%2Fmath%3E&fg=000000&svg=0').
        then(function(response) {
          expect(response.type).to.contain('image/png');
        });
  });

  it('Should return type of image as png', function() {
    return request(app).
        get('/mathml?mathml=%3Cmath%3E%3Cmsup%3E%3Cmi%3Ee%3C%2Fmi%3E%3Cmrow%3E%3Cmi%3Ei%3C%2Fmi%3E%3Cmi%3E%26%23x03C0%3B%3C%2Fmi%3E%3C%2Fmrow%3E%3C%2Fmsup%3E%3Cmo%3E%2B%3C%2Fmo%3E%3Cmn%3E1%3C%2Fmn%3E%3Cmo%3E%3D%3C%2Fmo%3E%3Cmn%3E0%3C%2Fmn%3E%3C%2Fmath%3E&fg=000000').
        then(function(response) {
          expect(response.type).to.contain('image/png');
        });
  });

  it('Bad MathML should return error status', function() {
    return request(app).
        get('/mathml?mathml=%3Cmath%3E%3Cmsup%3E%3Cmi%3Ee').
        then(function(response) {
          assert.equal(response.status, 500);
        });
  });

});