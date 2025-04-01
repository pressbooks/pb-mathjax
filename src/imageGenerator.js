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
const { log } = require('console');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const mathml = new MathML();
const asciimath = new AsciiMath();

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
  const query = configs.query || {};
  
  let myForeground = query.fg;
  let dpi = query.dpi;
  let isSvg = query.svg === true || query.svg === '1' || query.svg === 'true';

    // Configure TeX input
  let tex = new TeX({
    packages: configs.typeset.math.includes('\\require{physics}') ? AllPackages.concat(['physics']) : AllPackages,
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  });

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

  function stripRequireCommands(math) {
    return math.replace(/\\require\s*\{[^}]*\}\s*/g, '');
  }

  myForeground = isValidColor(myForeground) ? `#${myForeground}` : '#000000';

  dpi = parseInt(dpi);
  if (isNaN(dpi)) dpi = 75;
  if (dpi < 75) dpi = 75;
  if (dpi > 2400) dpi = 2400;

  try {
    if (!configs?.typeset?.math) {
      return handleError(res);
    }
    
    let decodedMath = configs.typeset.math;

    try {
      decodedMath = decodeURIComponent(decodedMath);
      decodedMath = decodedMath.replace(/&#038;/g, '&').replace(/&#38;/g, '&');
      decodedMath = decode(decodedMath);
    } catch (decodeError) {
      return handleError(res);
    }

    const math = stripRequireCommands(decodedMath);
    const isInline = (math.startsWith('\\(') && math.endsWith('\\)')) ||
        (math.startsWith('$') && math.endsWith('$') && !math.startsWith('$$'));
    const isBlock = (math.startsWith('\\[') && math.endsWith('\\]')) ||
        (math.startsWith('$$') && math.endsWith('$$'));

    let cleanMath = math.trim();
    if (isInline) {
      cleanMath = math.slice(math.startsWith('\\(') ? 2 : 1, -2);
    } else if (isBlock) {
      cleanMath = math.slice(2, -2);
    }

    try {
      const node = mathJaxDocument.convert(cleanMath, {
        display: !isInline,
        em: 16,
        ex: 8,
        containerWidth: 1000,
        lineWidth: 1000,
        scale: 1
      });


      let svgContent = adaptor.innerHTML(node);


      if (!svgContent || !svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        return handleError(res);
      }

      svgContent = svgContent.replace(
          /<svg([^>]*)style="([^"]*)"/,
          `<svg$1style="color: ${myForeground}; $2"`
      );

      if (svgContent.includes('merror')) {
        return handleError(res);
      }

      if (isSvg) {
        res.set('Content-Type', 'image/svg+xml');
        return res.send(svgContent);
      } else {
        try {
          if (!svgContent.trim().startsWith('<svg')) {
            return handleError(res);
          }

          // Set Content-Type header early
          res.set('Content-Type', 'image/png');

          let fullSvgContent = svgContent;
          
          if (!fullSvgContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
            fullSvgContent = fullSvgContent.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          
          if (!fullSvgContent.startsWith('<?xml')) {
            fullSvgContent = '<?xml version="1.0" standalone="no"?>\n' + fullSvgContent;
          }


          const sharp = require('sharp');
          const buffer = Buffer.from(fullSvgContent);
          const image = sharp(buffer, {
            density: dpi > 300 ? 300 : dpi,
            limitInputPixels: 5000 * 5000
          });

          const png = await image
            .resize(500, 500, {
              fit: 'inside',
              withoutEnlargement: true,
              background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png({
              compressionLevel: 6,
              adaptiveFiltering: false,
              force: true
            })
            .toBuffer();

          return res.send(png);
        } catch (pngError) {
          return handleError(res);
        }
      }
    } catch (err) {
      return handleError(res);
    }
  } catch (err) {
    return handleError(res);
  }
};