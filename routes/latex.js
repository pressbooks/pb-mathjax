'use strict';

const express = require('express');
const router = express.Router();
const imageGenerator = require('../src/imageGenerator');

router.get('/', (req, res, next) => {
  let formula = req.query.latex;
  
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
      format: req.query.format || 'TeX',
      speakText: req.query.speakText !== 'false', // a11y
      em: parseFloat(req.query.em) || 16,
      ex: parseFloat(req.query.ex) || 8,
      containerWidth: parseInt(req.query.width) || 1000,
      lineWidth: parseInt(req.query.lineWidth) || 1000,
      scale: parseFloat(req.query.scale) || 1
    },
    query: {
      ...req.query,
      svg: req.query.svg === '1' || req.query.svg === 'true',
      fg: req.query.fg || '000000', // Default to black
      dpi: parseInt(req.query.dpi) || 75, // Default to 75 DPI
      isBase64: req.query.isBase64 === 'true' || req.query.isBase64 === '1'
    }
  };

  // Validate formula
  if (!formula) {
    return res.status(400).json({
      error: 'Missing formula',
      message: 'The latex parameter is required'
    });
  }

  // Validate color format if provided
  if (req.query.fg && !/^[0-9A-Fa-f]{6}$/.test(req.query.fg)) {
    return res.status(400).json({
      error: 'Invalid color format',
      message: 'The fg parameter must be a 6-digit hex color without the # prefix'
    });
  }

  return imageGenerator.generate(configs, req, res, next);
});

module.exports = router;
