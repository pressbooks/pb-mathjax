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
  let pngOptions = {}

  // Leaving the old forumla here
  // myScale = Math.min(myScale * 10, 100);
  // if (isNaN(myScale) || myScale < 10) myScale = 10;
  // if(myScale == 1){ myScale = 30};

  // Make MathJax scale relative to WP LaTex
  if(myScale == 0){
    myScale = 1 * 12;
  }else{
    myScale = myScale * 12;
  }

  // If background is 'T', remove background parameter
  // to make background transparent
  if (myBackground == "T"){
    pngOptions = {
        scale: myScale,
    }
  }else{
    pngOptions = {
      background: "#" + myBackground,
      scale: myScale
    }
  }

  // Check to see if svg
  if(isSvg == 1){
    isSvg = true;
  }else {
    isSvg = false;
  }

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

    // Colors
    let svg = data.svg;
    svg = svg.replace(/<title/, `<style>svg { background-color: #${myBackground}; }</style><title`);
    svg = svg.replace(/stroke="currentColor"/g, `stroke="#${myForeground}"`);
    svg = svg.replace(/fill="currentColor"/g, `fill="#${myForeground}"`);

    if (isSvg) {
      // SVG
      res.set('Content-Type', 'image/svg+xml');
      res.send(svg);
    } else {
      // PNG
      convert(svg, pngOptions).then((png) => {
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
