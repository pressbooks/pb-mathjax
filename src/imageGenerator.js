'use strict';

const mjAPI = require('mathjax-node');
const sharp = require('sharp');
const path = require('path');
const assert = require('assert');

module.exports.generate = (configs, req, res, next) => {

  // --------------------------------------------------------------------------
  // Params
  // --------------------------------------------------------------------------

  let myForeground = req.query.fg;
  let myFont = req.query.font;
  let dpi = req.query.dpi;
  let isSvg = req.query.svg;

  // --------------------------------------------------------------------------
  // Sanitize Params
  // --------------------------------------------------------------------------

  // Font
  function inArray(needle, haystack) {
    let length = haystack.length;
    for (let i = 0; i < length; i++) {
      if (haystack[i] === needle) return true;
    }
    return false;
  }
  const possibleFonts = [
    'TeX',
    'STIX-Web',
    'Asana-Math',
    'Neo-Euler',
    'Gyre-Pagella',
    'Gyre-Termes',
    'Latin-Modern',
  ];
  if (!inArray(myFont, possibleFonts)) {
    myFont = possibleFonts[0];
  }
  configs.mathjax.MathJax.SVG.font = myFont;

  // Font Color
  function isValidColor(str) {
    return str.match(/^#[a-f0-9]{6}$/i) !== null;
  }
  myForeground = isValidColor(`#${myForeground}`)
      ? `#${myForeground}`
      : '#000000';

  // Dpi
  dpi = parseInt(dpi);
  if (isNaN(dpi)) dpi = 75;
  if (dpi < 75) dpi = 75; // Min
  if (dpi > 2400) dpi = 2400; // Max

  // Check to see if SVG
  isSvg = !(!isSvg || isSvg === '0');

  // Setup CSS for SVG
  const svgCss = `color: ${myForeground};`;

  // --------------------------------------------------------------------------
  // Convert math into an image
  // --------------------------------------------------------------------------

  // Error image
  function formulaDoesNotParse(err) {
    console.error(err);
    res.set('pb-mathjax-error', 'Formula does not parse');
    return res.sendFile(
        path.resolve('public/images/formula_does_not_parse.png'));
  }

  // Consider an init longer than 5 seconds a crash and exit
  const tooLong = setTimeout(() => {
    // @see https://github.com/mathjax/MathJax-node/issues/441
    console.error('Too long, Something crashed? Please restart the server.');
    process.exit(1);
  }, 6000);
  try {
    mjAPI.config(configs.mathjax);
    assert.deepEqual(configs.mathjax, req.app.locals.globalMathJaxConfig,
        'MathJax configuration has changed, restart mathjax-node');
  } catch (e) {
    console.debug(e.message);
    req.app.locals.globalMathJaxConfig = JSON.parse(
        JSON.stringify(configs.mathjax)); // Clone without reference
    mjAPI.start();
  }
  mjAPI.typeset(configs.typeset).then((data) => {
    clearTimeout(tooLong);
    if (data.width === '0') {
      throw new Error('Width equals 0, broken SVG');
    }
    // Inject CSS
    let svg = data.svg;
    svg = svg.replace(/<title/,
        `<style>/* <![CDATA[ */ svg { ${svgCss} } /* ]]> */</style><title`);
    if (isSvg) {
      // SVG
      res.set('Content-Type', 'image/svg+xml');
      return res.send(svg);
    } else {
      // PNG
      sharp(Buffer.from(svg), {density: dpi}).png().toBuffer().then((png) => {
        res.set('Content-Type', 'image/png');
        return res.send(png);
      }).catch((err) => {
        console.error('There was a problem with Sharp:');
        return formulaDoesNotParse(err);
      });
    }
  }).catch((err) => {
    clearTimeout(tooLong);
    console.error('There was a problem with MathJax.Typeset:');
    return formulaDoesNotParse(err);
  });

};