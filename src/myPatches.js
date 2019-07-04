'use strict';

MathJax.Extension['mypatches'] = {
  version: '0.0.1',
};

MathJax.Hub.Register.StartupHook('SVG Jax Ready', function() {
  // Helper
  function checkNested(obj, level, ...rest) {
    if (obj === undefined) return false;
    if (rest.length === 0 && obj.hasOwnProperty(level)) return true;
    return checkNested(obj[level], ...rest);
  }

  // @see https://github.com/mathjax/MathJax/issues/2035
  if (checkNested(MathJax, 'AuthorConfig', 'SVG', 'font') &&
      MathJax.AuthorConfig.SVG.font === 'STIX-Web') {
    let SVG = MathJax.OutputJax.SVG;
    SVG.Augment({FONTDATA: {VARIANT: {'bold-italic': {offsetA: 0x1D468}}}});
  }
});

MathJax.Callback.Queue(['loadComplete', MathJax.Ajax, '[mypatches]/myPatches.js']);