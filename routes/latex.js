const mjAPI = require('mathjax-node');
const {convert} = require('convert-svg-to-png');
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {

  // --------------------------------------------------------------------------
  // Params
  // --------------------------------------------------------------------------

  let myLatex = req.query.latex;
  let myBackground = req.query.bg;
  let myForeground = req.query.fg;
  let myFontSize = req.query.s;
  let myScale = req.query.zoom;
  let isSvg = req.query.svg;

  // --------------------------------------------------------------------------
  // Sanitize Params
  // --------------------------------------------------------------------------

  function isValidColor(str) {
    return str.match(/^#[a-f0-9]{6}$/i) !== null;
  }

  // background-color
  if (!myBackground || myBackground.toLowerCase() === 't') {
    myBackground = 'transparent';
  } else {
    myBackground = isValidColor(`#${myBackground}`) ? `#${myBackground}` : 'transparent';
  }

  // color
  myForeground = isValidColor(`#${myForeground}`) ? `#${myForeground}` : '#000000';

  // Make MathJax scale relative to WP LaTex
  if (!myScale || myScale === '0') {
    myScale = 12;
  } else {
    myScale = myScale * 12;
    if (myScale > 120) {
      myScale = 120;
    }
    if (myScale < 12) {
      myScale = 12;
    }
  }

  //  TODO
  myFontSize = 'medium';

  // Check to see if SVG
  isSvg = !(!isSvg || isSvg === '0');

  // --------------------------------------------------------------------------
  // Convert LaTeX into an image
  // --------------------------------------------------------------------------

  // Setup CSS for SVG
  const svgCss = `background-color: ${myBackground}; color: ${myForeground}; font-size: ${myFontSize}`;

  // Init Mathjax to parse LaTeX
  mjAPI.config({
    MathJax: {
      displayMessages: false,
      displayErrors: false,
      TeX: {
        // @see http://docs.mathjax.org/en/latest/tex.html
        extensions: ['cancel.js', 'mhchem.js'],
      },
    },
  });
  mjAPI.start();

  // Convert LaTex into an image
  mjAPI.typeset({
    math: myLatex,
    format: 'TeX',
    svg: true,
    speakText: true, // a11y
  }).then((data) => {
    // Inject CSS
    let svg = data.svg;
    svg = svg.replace(/<\/title>/, `</title><style>/* <![CDATA[ */ svg { ${svgCss} } /* ]]> */</style>`);
    if (isSvg) {
      // SVG
      res.set('Content-Type', 'image/svg+xml');
      res.send(svg);
    } else {
      // PNG
      convert(svg, {
        scale: myScale,
        puppeteer: {args: ['--no-sandbox', '--disable-setuid-sandbox']},
      }).then((png) => {
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
