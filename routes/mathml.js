'use strict';

const express = require('express');
const router = express.Router();
const imageGenerator = require('../src/imageGenerator');

router.get('/', (req, res, next) => {

  let formula = req.query.mathml;

    // Check if the formula is base64 encoded
    if (req.query.isBase64 === 'true' || req.query.isBase64 === '1' && formula) {
      try {
        formula = Buffer.from(formula, 'base64').toString('utf-8');
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid base64 string',
          message: 'The provided formula is not a valid base64 encoded string'
        });
      }
    }

  const configs = {
    typeset: {
      math: formula,
      format: 'MathML',
      svg: true,
      speakText: true, // a11y
    },
    query: {
      ...req.query,
      svg: req.query.svg === '1' || req.query.svg === 'true',
      fg: req.query.fg || '000000', // Default to black
      dpi: parseInt(req.query.dpi) || 75, // Default to 75 DPI
      isBase64: req.query.isBase64 === 'true' || req.query.isBase64 === '1'
    }
  };

  return imageGenerator.generate(configs, req, res, next);

});

module.exports = router;
