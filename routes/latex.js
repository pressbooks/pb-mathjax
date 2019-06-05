"use strict";

const mjAPI = require('mathjax-node');
const sharp = require('sharp')
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {

  // --------------------------------------------------------------------------
  // Params
  // --------------------------------------------------------------------------

  let myMath = req.query.latex;
  let myForeground = req.query.fg;
  let dpi = req.query.dpi;
  let isSvg = req.query.svg;

  // --------------------------------------------------------------------------
  // Sanitize Params
  // --------------------------------------------------------------------------

  // Font Color
  function isValidColor(str) {
    return str.match(/^#[a-f0-9]{6}$/i) !== null;
  }
  myForeground = isValidColor(`#${myForeground}`) ? `#${myForeground}` : '#000000';

  // Dpi
  dpi = parseInt(dpi);
  if (isNaN(dpi)) dpi = 72;
  if (dpi < 72) dpi = 72; // Min
  if (dpi > 2400) dpi = 2400; // Max

  // Check to see if SVG
  isSvg = !(!isSvg || isSvg === '0');

  // --------------------------------------------------------------------------
  // Convert LaTeX into an image
  // --------------------------------------------------------------------------

  // Setup CSS for SVG
  const svgCss = `color: ${myForeground};`;

  // Init Mathjax to parse LaTeX
  mjAPI.config({
    MathJax: {
      displayMessages: false,
      displayErrors: false,
      TeX: {
        // @see http://docs.mathjax.org/en/latest/tex.html
        extensions: ['autoload-all.js'],
      },
    },
  });

  // Convert LaTex into an image
  mjAPI.typeset({
    math: myMath,
    format: 'TeX',
    svg: true,
    speakText: true, // a11y
  }).then((data) => {
    // Inject CSS
    let svg = data.svg;
    svg = svg.replace(/<title/, `<style>/* <![CDATA[ */ svg { ${svgCss} } /* ]]> */</style><title`);
    if (isSvg) {
      // SVG
      res.set('Content-Type', 'image/svg+xml');
      res.send(svg);
    } else {
      // PNG
      sharp(Buffer.from(svg), { density: dpi })
      .png()
      .toBuffer()
      .then((png) => {
        res.set('Content-Type', 'image/png');
        res.send(png);
      }).catch((error) => {
        next(error);
      });
    }
  }).catch((error) => {
    error = new Error(error.toString()); // TODO: Why isn't this an error object?
    next(error);
  });
});

module.exports = router;
