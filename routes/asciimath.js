'use strict';

const express = require('express');
const router = express.Router();
const imageGenerator = require('../src/imageGenerator');

router.get('/', (req, res, next) => {

  const configs = {
    mathjax: {
      MathJax: {
        extensions: ['Safe.js'],
        displayMessages: false,
        displayErrors: false,
        AsciiMath: {
          // @see http://docs.mathjax.org/en/latest/asciimath.html
        },
        SVG: {
          blacker: 0,
        },
      },
    },
    typeset: {
      math: req.query.asciimath,
      format: 'AsciiMath',
      svg: true,
      speakText: true, // a11y
    },
  };

  return imageGenerator.generate(configs, req, res, next);

});

module.exports = router;
