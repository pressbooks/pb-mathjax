'use strict';

const express = require('express');
const router = express.Router();
const imageGenerator = require('../src/imageGenerator');

router.get('/', (req, res, next) => {

  const configs = {
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
