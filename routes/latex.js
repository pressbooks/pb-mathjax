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
  let myScale = req.query.zoom;
  let isSvg = req.query.svg;

  // --------------------------------------------------------------------------
  // Sanitize Params
  // --------------------------------------------------------------------------

  myScale = Math.min(myScale * 10, 100);
  if (isNaN(myScale) || myScale < 10) myScale = 10;

  // --------------------------------------------------------------------------
  // Convert LaTeX into an image
  // --------------------------------------------------------------------------

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
    if (isSvg) {
      // SVG
      res.set('Content-Type', 'image/svg+xml');
      res.send(data.svg);
    } else {
      // PNG
      convert(data.svg, {
        background: myBackground,
        scale: myScale,
      }).then((png) => {
        res.set('Content-Type', 'image/png');
        res.send(png);
      }).catch((error) => {
        console.log(['happening 1!', error]);
        next(error);
      });
    }
  }).catch((error) => {
    error = new Error(error.toString()); // TODO: Why isn't this an error object?
    next(error);
  });
});

module.exports = router;
