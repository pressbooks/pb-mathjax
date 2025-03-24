const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app');

describe('Testing the /latex route', function() {

    const assert = require('assert');
    const expect = require('chai').expect;
    const request = require('supertest');
    const app = require('../app');

    describe('Testing the /latex route', function() {

        // ✅ LaTeX Delimiters
        it('Should render inline LaTeX delimiters \( ... \)', function() {
            return request(app)
                .get('/latex?latex=%5C(%20alpha%20A%20%5Cchi%20X%20%5C)&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        it('Should render block LaTeX delimiters \[ ... \]', function() {
            return request(app)
                .get('/latex?latex=%5C[%20sum_%7Bi%3D0%7D%5En%20i%5E2%20%3D%20%5Cfrac%7B(n%5E2%2Bn)(2n%2B1)%7D%7B6%7D%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Dollar Sign Delimiters
        it('Should render inline math using dollar signs', function() {
            return request(app)
                .get('/latex?latex=%24alpha%20A%20%5Cchi%20X%20%24&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        it('Should render block math using double dollar signs', function() {
            return request(app)
                .get('/latex?latex=%24%24sum_%7Bi%3D0%7D%5En%20i%5E2%20%3D%20%5Cfrac%7B(n%5E2%2Bn)(2n%2B1)%7D%7B6%7D%24%24&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ AMS Math Package
        it('Should render AMS align environment', function() {
            return request(app)
                .get('/latex?latex=%5C[%5Cbegin%7Balign%7D%20E%20%26%3D%20mc%5E2%20%5C%5C%20F%20%26%3D%20ma%20%5Cend%7Balign%7D%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Mathtools
        it('Should render Mathtools gather environment', function() {
            return request(app)
                .get('/latex?latex=%5C[%5Cbegin%7Bgathered%7D%20a%20%5Ccoloneqq%20b%20%2B%20c%20%5C%5C%20x%20%5Ciff%20y%20%5Cend%7Bgathered%7D%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Physics Package
        it('Should render physics macros', function() {
            return request(app)
                .get('/latex?latex=%5C[%20%5Cdv%7Bf%7D%7Bx%7D%2C%20%5Cpdv%7Bf%7D%7Bx%7D%2C%20%5Cexpval%7BA%7D%2C%20%5Cket%7B%5Cpsi%7D%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Braket Package
        it('Should render Dirac bra-ket notation', function() {
            return request(app)
                .get('/latex?latex=%5C[%20%5Cbra%7B%5Cpsi%7D%20H%20%5Cket%7B%5Cphi%7D%20%3D%20E%20%5Cbraket%7B%5Cpsi%20%7C%20%5Cphi%7D%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ mhchem
        it('Should render chemical equations', function() {
            return request(app)
                .get('/latex?latex=%5C[%20%5Cce%7B2H2%20%2B%20O2%20-%3E%202H2O%7D%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Text Macros
        it('Should render text macros', function() {
            return request(app)
                .get('/latex?latex=%5C[%20%5Ctextbf%7BBold%7D%20%5Ctextit%7BItalic%7D%20%5Ctextsc%7BSmallCaps%7D%20%5Ctexttt%7BMonospace%7D%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Color Package
        it('Should render colored text', function() {
            return request(app)
                .get('/latex?latex=%5C[%20%5Ctextcolor%7Bred%7D%7BThis%20is%20red%20text%7D%20%5Cquad%20%5Ccolor%7Bblue%7DThis%20is%20blue%20text%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Enclose Package
        it('Should render enclosed symbols', function() {
            return request(app)
                .get('/latex?latex=%5C[%20%5Cenclose%7Bcircle%7D%7Bx%7D%2C%20%5Cenclose%7Bbox%7D%7By%7D%2C%20%5Cenclose%7Bupdiagonalstrike%7D%7Bz%7D%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Tag Formatting
        it('Should render equation with a custom tag', function() {
            return request(app)
                .get('/latex?latex=%5C[%20%5Cbegin%7Bequation%7D%20E%20%3D%20mc%5E2%20%5Ctag%7BEinstein%7D%20%5Cend%7Bequation%7D%20%5C]&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Matrix Formatting
        it('Should render a matrix', function() {
            return request(app)
                .get('/latex?latex=\\det \\begin{bmatrix} a %26 b \\\\ c %26 d \\end{bmatrix} %3D ad %26%238211%3B bc&fg=000000&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Require Package not required because all commands are included in the default MathJax configuration
        it('Should strip require command and return parsed formula', function() {
            return request(app)
                .get('/latex?latex=\\require{physics} \\( \\dv{f}{x}, \\pdv{f}{x}, \\expval{A}, \\ket{\\psi} \\)&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
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