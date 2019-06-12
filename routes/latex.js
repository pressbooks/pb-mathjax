"use strict";

const mjAPI = require('mathjax-node');
const sharp = require('sharp');
const express = require('express');
const router = express.Router();
const path = require('path');

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

  // Error image, just in case
  const formulaDoesNotParse = path.resolve('public/images/formula_does_not_parse.png');

  // Setup CSS for SVG
  const svgCss = `color: ${myForeground};`;

  // Init Mathjax to parse LaTeX
  mjAPI.config({
    MathJax: {
      extensions: [ 'Safe.js' ],
      displayMessages: false,
      displayErrors: true,
      TeX: {
        // @see http://docs.mathjax.org/en/latest/tex.html
        extensions: ['autoload-all.js'],
      },
      SVG: {
        blacker: 0,
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
    if (data.width === '0') {
      throw new Error('Width equals 0, broken SVG');
    }
    // Inject CSS
    let svg = data.svg;
    svg = svg.replace(/<title/, `<style>/* <![CDATA[ */ svg { ${svgCss} } /* ]]> */</style><title`);
    if (isSvg) {
      // SVG
      return res.set('Content-Type', 'image/svg+xml').send(svg);
    } else {
      // PNG
      sharp(Buffer.from(svg), { density: dpi })
      .png()
      .toBuffer()
      .then((png) => {
        return res.set('Content-Type', 'image/png').send(png);
      }).catch((error) => {
        console.error('There was a problem with Sharp:');
        console.error(error);
        return res.status(500).sendFile(formulaDoesNotParse);
      });
    }
  }).catch((error) => {
    console.error('There was a problem with MathJax:');
    console.error(error);
    return res.status(500).sendFile(formulaDoesNotParse);
  });
});

module.exports = router;
