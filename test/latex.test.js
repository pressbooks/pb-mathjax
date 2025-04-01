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
                .get('/latex?latex=XCggXFxhbHBoYSBBIFxcY2hpIFggXCk&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        it('Should render block LaTeX delimiters \[ ... \]', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcc3VtX3tpPTB9Xm4gaV4yID0gXFxmcmFjeyhuXjIrbil7Mn0oMm4rMSl9ezZ9IFxd&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Dollar Sign Delimiters
        it('Should render inline math using dollar signs', function() {
            return request(app)
                .get('/latex?latex=JFxcYWxwaGEgQSBcXGNoaSBYICQ&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        it('Should render block math using double dollar signs', function() {
            return request(app)
                .get('/latex?latex=JCRcXHN1bV97aT0wfV5uIGleMiA9IFxcZnJhY3sobl4yK24pKDJuKzEpfXs2fSQk&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ AMS Math Package
        it('Should render AMS align environment', function() {
            return request(app)
                .get('/latex?latex=XFtcYmVnaW57YWxpZ259IEUgJj0gbWNeMiBcXFxcIEYgJj0gbWEgXGVuZHthbGlnbn1cXQ&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Mathtools
        it('Should render Mathtools gather environment', function() {
            return request(app)
                .get('/latex?latex=XFtcYmVnaW57Z2F0aGVyZWR9IGEgXGNvbG9uZXFxIGIgKyBjIFxcXFwgeCBcaWZmIHkgXGVuZHtnYXRoZXJlZH1cXQ&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Physics Package
        it('Should render physics macros', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcZHZ7Zn17eH0sIFxccGR2e2Z9e3h9LCBcXGV4cHZhbHtBfSwgXFxrZXR7XFxwcml9IFxd&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Braket Package
        it('Should render Dirac bra-ket notation', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcYnJhe1xccHNpfSBIIFxca2V0e1xccGhpfSA9IEUgXFxicmFrZXR7XFxwc2kgfCBcXHBoaX0gXF0&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ mhchem
        it('Should render chemical equations', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcY2V7MkgyICsgTzIgLT4gMkgyT30gXF0&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Text Macros
        it('Should render text macros', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcYmVmdGV4dHtCb2xkfSBcXGl0YWxpY3tJdGFsaWN9IFxcdGV4dHNje1NtYWxsQ2Fwc30gXFx0ZXh0dHR7TW9ub3NwYWNlfSBcXQ&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Color Package
        it('Should render colored text', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcdGV4dGNvbG9ye3JlZH17VGhpcyBpcyByZWQgdGV4dH0gXFxxdWFkIFxcY29sb3J7Ymx1ZX1UaGlzIGlzIGJsdWUgdGV4dCBcXQ&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Enclose Package
        it('Should render enclosed symbols', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcZW5jbG9zZXtjaXJjbGV9e3h9LCBcXGVuY2xvc2V7Ym94fXt5fSwgXFxlbmNsb3Nle3VwZGlhZ29uYWxzdHJpa2V9e3p9IFxd&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Tag Formatting
        it('Should render equation with a custom tag', function() {
            return request(app)
                .get('/latex?latex=XFtcIFxcYmVnaW57ZXF1YXRpb259IEUgPSBtY14yIFxcdGFne0VpbnN0ZWlufSBcXGVuZHtlcXVhdGlvbn0gXF0&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        // ✅ Matrix Formatting
        it('Should render a matrix', function() {
            return request(app)
                .get('/latex?latex=XFtcZGV0IFxiZWdpbntibWF0cml4fSBhICYgYiBcXFxcIGMgJiBkIFxlbmR7Ym1hdHJpeH0gPSBhZCAtIGJjXF0&isBase64=1&svg=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                });
        });

        it('Should load physics package for base64 encoded formula when required', function() {
            // Base64 encoded: \require{physics} \divergence \vec{E} = \frac{\rho}{\epsilon_0}
            return request(app)
                .get('/latex?latex=XHJlcXVpcmV7cGh5c2ljc30gXGRpdmVyZ2VuY2UgXHZlY3tFfSA9IFxmcmFjeyRccmhvfXskXGVwc2lsb25fMH0=&svg=1&isBase64=1')
                .then(function(response) {
                    expect(response.type).to.contain('image/svg+xml');
                    const svgContent = response.body.toString('utf-8');
                    expect(svgContent).to.include('svg');
                    
                    // Extract width from SVG
                    const widthMatch = svgContent.match(/width="([0-9.]+)([a-zA-Z]+)"/);
                    expect(widthMatch).to.not.be.null;
                    const width = parseFloat(widthMatch[1]);
                    const unit = widthMatch[2];
                    
                    // Convert to ex if needed
                    let widthInEx = width;
                    if (unit === 'px') {
                        widthInEx = width / 8; // Approximate conversion from px to ex
                    }
                    
                    // Width should be less than 30ex (indicating proper symbol rendering)
                    expect(widthInEx).to.be.lessThan(30);
                });
        });

    });

    it('Should return type of image as png', function() {
        return request(app)
            .get('/latex?latex=eF5uICsgeV5uID0gel5u&isBase64=1&svg=0')
            .then(function(response) {
                expect(response.type).to.contain('image/png');
            });
    });

    it('Should return type of image as png by default', function() {
        return request(app)
            .get('/latex?latex=eF5uICsgeV5uID0gel5u&isBase64=1')
            .then(function(response) {
                expect(response.type).to.contain('image/png');
            });
    });

    it('Bad LaTex should return error status', function() {
        return request(app)
            .get('/latex?latex=XFxMYVRlWCZzPVg&isBase64=1&svg=1')
            .then(function(response) {
                expect(response.type).to.contain('image/png');
                expect(response.get('pb-mathjax-error')).to.equal('Formula does not parse');
            });
    });

});