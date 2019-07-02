'use strict';

MathJax.Extension['mypatches'] = {
  version: '0.0.1',
};

// @see https://github.com/mathjax/MathJax/issues/2035
MathJax.Hub.Register.StartupHook('SVG Jax Ready', function() {
  let SVG = MathJax.OutputJax.SVG;
  SVG.Augment({FONTDATA: {VARIANT: {'bold-italic': {offsetA: 0x1D468}}}});
});

MathJax.Callback.Queue(['loadComplete', MathJax.Ajax, '[mypatches]/myPatches.js']);