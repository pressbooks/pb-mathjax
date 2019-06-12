'use strict';

const mjAPI = require('mathjax-node');
const sharp = require('sharp');
const path = require('path');

module.exports.generate = (configs, req, res, next) => {

  // --------------------------------------------------------------------------
  // Params
  // --------------------------------------------------------------------------

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

  // Setup CSS for SVG
  const svgCss = `color: ${myForeground};`;

  // --------------------------------------------------------------------------
  // Convert math into an image
  // --------------------------------------------------------------------------

  // Error image, just in case
  function formulaDoesNotParse(err) {
    const img = path.resolve('public/images/formula_does_not_parse.png');
    console.error('There was a problem with MathJax:');
    console.error(err);
    res.set('pb-mathjax-error', 'Formula does not parse');
    return res.sendFile(img);
  }

  try {
    mjAPI.config(configs.mathjax);
    mjAPI.typeset(configs.typeset).then((data) => {
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
          return formulaDoesNotParse(err);
        });
      }
    }).catch((err) => {
      return formulaDoesNotParse(err);
    });
  } catch (err) {
    return formulaDoesNotParse(err);
  }

};