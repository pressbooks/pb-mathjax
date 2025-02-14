'use strict';

const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: AllPackages.concat(['physics']),
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$'], ['\\[', '\\]']],
});

const svg = new SVG({ fontCache: 'none' });

const mathJaxDocument = mathjax.document('', {
  InputJax: tex,
  OutputJax: svg
});

module.exports.generate = async (configs, req, res, next) => {
  let myForeground = req.query.fg;
  let myFont = req.query.font;
  let dpi = req.query.dpi;
  let isSvg = req.query.svg;

  function inArray(needle, haystack) {
    return haystack.includes(needle);
  }

  const possibleFonts = [
    'TeX', 'STIX-Web', 'Asana-Math', 'Neo-Euler',
    'Gyre-Pagella', 'Gyre-Termes', 'Latin-Modern',
  ];
  if (!inArray(myFont, possibleFonts)) {
    myFont = 'TeX';
  }

  function isValidColor(str) {
    return /^#[a-f0-9]{6}$/i.test(`#${str}`);
  }

  myForeground = isValidColor(myForeground) ? `#${myForeground}` : '#000000';

  dpi = parseInt(dpi);
  if (isNaN(dpi)) dpi = 75;
  if (dpi < 75) dpi = 75;
  if (dpi > 2400) dpi = 2400;

  isSvg = !(!isSvg || isSvg === '0');

  try {
    const math = configs.typeset.math || '';

    const isInline = (math.startsWith('\\(') && math.endsWith('\\)')) ||
        (math.startsWith('$') && math.endsWith('$') && !math.startsWith('$$'));

    const isBlock = (math.startsWith('\\[') && math.endsWith('\\]')) ||
        (math.startsWith('$$') && math.endsWith('$$'));

    let cleanMath = math.trim();

    // Clean delimiters
    if (isInline) {
      if (math.startsWith('\\(') && math.endsWith('\\)')) {
        cleanMath = math.slice(2, -2);
      } else if (math.startsWith('$') && math.endsWith('$')) {
        cleanMath = math.slice(1, -1);
      }
    } else if (isBlock) {
      cleanMath = math.slice(2, -2);
    }

    const node = mathJaxDocument.convert(cleanMath, { display: !isInline });
    let svgContent = adaptor.innerHTML(node);

    if (!svgContent.includes('<svg')) {
      throw new Error('Invalid SVG output');
    }

    svgContent = svgContent.replace(
        /<svg([^>]*)style="([^"]*)"/,
        `<svg$1style="color: ${myForeground}; $2"`
    );

    if (isSvg) {
      res.set('Content-Type', 'image/svg+xml');
      return res.send(svgContent);
    } else {
      // Convert SVG to PNG
      const sharp = require('sharp');
      const png = await sharp(Buffer.from(svgContent), { density: dpi }).png().toBuffer();
      res.set('Content-Type', 'image/png');
      return res.send(png);
    }
  } catch (err) {
    console.error(err);
    res.set('pb-mathjax-error', 'Formula does not parse');
    const path = require('path');
    return res.sendFile(path.resolve('public/images/formula_does_not_parse.png'));
  }
};