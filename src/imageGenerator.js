'use strict';

const mjAPI = require('mathjax-node');
const sharp = require('sharp');
const path = require('path');
const deepEqual = require('fast-deep-equal');
const chillout = require('chillout');

/**
 * @param configs Configurations supplied by the route
 * @param configs.typeset MathJax-Node typeset options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports.generate = async (configs, req, res, next) => {

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
  // One MathJax Config To Rule Them All (performance/crashing fix)
  // --------------------------------------------------------------------------

  const mathJaxConfig = {
    MathJax: {
      extensions: ['Safe.js'],
      displayMessages: false,
      displayErrors: false,
      TeX: {
        // @see http://docs.mathjax.org/en/latest/tex.html
        extensions: ['autoload-all.js'],
      },
      AsciiMath: {
        // @see http://docs.mathjax.org/en/latest/asciimath.html
      },
      MathML: {
        // @see http://docs.mathjax.org/en/latest/mathml.html
        extensions: ['content-mathml.js'],
      },
      SVG: {
        blacker: 0,
        font: myFont
      },
    },
  };

  // --------------------------------------------------------------------------
  // Convert math into an image
  // --------------------------------------------------------------------------

  // Error image
  function formulaDoesNotParse(err) {
    console.error(err);
    console.debug('Sending back: formula_does_not_parse.png');
    res.set('pb-mathjax-error', 'Formula does not parse');
    return res.sendFile(
        path.resolve('public/images/formula_does_not_parse.png'));
  }

  // Consider an init longer than 7 seconds a crash and exit
  const tooLong = setTimeout(() => {
    // @see https://github.com/mathjax/MathJax-node/issues/441
    console.error('Too long, Something crashed? Please restart the server.');
    process.exit(1);
  }, 7000);

  try {
    const restartTime = Date.now();
    await chillout.waitUntil(() => {
      if (req.app.locals.globalMathJaxIsRestarting === false || (Date.now() - restartTime) > 10000 ) {
        return chillout.StopIteration; // break loop
      }
    });
    req.app.locals.globalMathJaxIsRestarting = true;
    // Configure
    mjAPI.config(mathJaxConfig);
    if (req.app.locals.globalMathJaxConfig === null) {
      // Start is done automatically when typeset is first called
      req.app.locals.globalMathJaxConfig = JSON.parse(JSON.stringify(mathJaxConfig)); // Clone without reference
    } else if (!deepEqual(mathJaxConfig, req.app.locals.globalMathJaxConfig)) {
      // Start
      console.debug('MathJax configuration has changed, restart mathjax-node');
      req.app.locals.globalMathJaxConfig = JSON.parse(JSON.stringify(mathJaxConfig)); // Clone without reference
      mjAPI.start();
    }

    // Typeset
    let data = await mjAPI.typeset(configs.typeset);
    req.app.locals.globalMathJaxIsRestarting = false;
    clearTimeout(tooLong);
    if (data.width === '0') {
      return formulaDoesNotParse('Width equals 0, broken SVG');
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
      let png = await sharp(Buffer.from(svg), {density: dpi}).png().toBuffer();
      res.set('Content-Type', 'image/png');
      return res.send(png);
    }
  } catch (err) {
    req.app.locals.globalMathJaxIsRestarting = false;
    clearTimeout(tooLong);
    return formulaDoesNotParse(err);
  }

};