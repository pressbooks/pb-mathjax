'use strict';

const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { MathML } = require('mathjax-full/js/input/mathml.js');
const { AsciiMath } = require('mathjax-full/js/input/asciimath.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');
const { decode } = require('html-entities');


const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const extraPackages = ['physics'];

// Configure TeX input
const tex = new TeX({
  packages: AllPackages.concat(extraPackages),
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$'], ['\\[', '\\]']]
});

const mathml = new MathML();
const asciimath = new AsciiMath(); // Enable AsciiMath input

const svg = new SVG({
  fontCache: 'none',
  mtextInheritFont: true,
  mathmlSpacing: false
});

function handleError(res) {
  res.set('pb-mathjax-error', 'Formula does not parse');
  const path = require('path');
  return res.status(400).sendFile(path.resolve('public/images/formula_does_not_parse.png'));
}

module.exports.generate = async (configs, req, res, next) => {
  let myForeground = req.query.fg;
  let dpi = req.query.dpi;
  let isSvg = req.query.svg;

  let inputFormat = tex;

  switch (configs.typeset.format) {
    case 'TeX':
      break;
    case 'MathML':
        inputFormat = mathml;
      break;
    case 'AsciiMath':
        inputFormat = asciimath;
      break;
    default:
      return handleError(res);
  }

  const mathJaxDocument = mathjax.document('', {
    InputJax: inputFormat,
    OutputJax: svg
  });

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
    if (!configs?.typeset?.math) {
      console.log('No math provided');
      return handleError(res);
    }
    // Decode HTML entities in the math input
    const math = decode(configs.typeset.math);

    const isInline = (math.startsWith('\\(') && math.endsWith('\\)')) ||
        (math.startsWith('$') && math.endsWith('$') && !math.startsWith('$$'));

    const isBlock = (math.startsWith('\\[') && math.endsWith('\\]')) ||
        (math.startsWith('$$') && math.endsWith('$$'));

    let cleanMath = math.trim();

    if (isInline) {
      if (math.startsWith('\\(') && math.endsWith('\\)')) {
        cleanMath = math.slice(2, -2);
      } else if (math.startsWith('$') && math.endsWith('$')) {
        cleanMath = math.slice(1, -1);
      }
    } else if (isBlock) {
      cleanMath = math.slice(2, -2);
    }

    let svgContent;
    try {
      const node = mathJaxDocument.convert(cleanMath, {
        display: !isInline,
        em: 16,
        ex: 8,
        containerWidth: 1000,
        lineWidth: 1000,
        scale: 1
      });

      svgContent = adaptor.innerHTML(node);

      if (!svgContent || !svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        return handleError(res);
      }

      svgContent = svgContent.replace(
          /<svg([^>]*)style="([^"]*)"/,
          `<svg$1style="color: ${myForeground}; $2"`
      );

      if (svgContent.includes('merror')) {
        console.error('MathJax detected an error:', svgContent);
        return handleError(res);
      }

      if (isSvg) {
        res.set('Content-Type', 'image/svg+xml');
        return res.send(svgContent);
      } else {
        const sharp = require('sharp');
        const png = await sharp(Buffer.from(svgContent), { density: dpi }).png().toBuffer();
        res.set('Content-Type', 'image/png');
        return res.send(png);
      }
    } catch (err) {
      console.error('MathJax processing error:', err);
      return handleError(res);
    }
  } catch (err) {
    console.error('General error:', err);
    return handleError(res);
  }
};