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
        TeX: {
          // @see http://docs.mathjax.org/en/latest/tex.html
          extensions: ['autoload-all.js'],
        },
        SVG: {
          blacker: 0,
        },
      },
    },
    typeset: {
      math: req.query.latex,
      format: 'TeX',
      svg: true,
      speakText: true, // a11y
    },
  };

  return imageGenerator.generate(configs, req, res, next);

});

module.exports = router;
