A replacement for `https://wp.com/latex.php`  but instead of LaTeX, it uses [MathJax](https://www.mathjax.org/).

# Installation

First, install Node.js

Next:

    git clone git@github.com:pressbooks/pb-mathjax.git
    cd pb-mathjax
    npm install
    npm start
    
Finally, go to: http://localhost:3000/  

# Synopsis

Auttomatic's open-source Jetpack plugin has a [LaTeX feature](https://en.support.wordpress.com/latex/) that [is hardcoded](https://github.com/Automattic/jetpack/blob/45a6dfefbd8f4239cd61cbd28f361e9ef6036cac/modules/latex.php#L87)
to call `https://s0.wp.com/latex.php`

It works like this:

<p><img src="https://s0.wp.com/latex.php?latex=%5Cdisplaystyle+P_%5Cnu%5E%7B-%5Cmu%7D%28z%29%3D%5Cfrac%7B%5Cleft%28z%5E2-1%5Cright%29%5E%7B%5Cfrac%7B%5Cmu%7D%7B2%7D%7D%7D%7B2%5E%5Cmu+%5Csqrt%7B%5Cpi%7D%5CGamma%5Cleft%28%5Cmu%2B%5Cfrac%7B1%7D%7B2%7D%5Cright%29%7D%5Cint_%7B-1%7D%5E1%5Cfrac%7B%5Cleft%281-t%5E2%5Cright%29%5E%7B%5Cmu+-%5Cfrac%7B1%7D%7B2%7D%7D%7D%7B%5Cleft%28z%2Bt%5Csqrt%7Bz%5E2-1%7D%5Cright%29%5E%7B%5Cmu-%5Cnu%7D%7Ddt&amp;fg=000000&bg=T" ></p>

I.e.

```html
<img 
src="https://s0.wp.com/latex.php?latex=%5Cdisplaystyle+P_%5Cnu%5E%7B-%5Cmu%7D%28z%29%3D%5Cfrac%7B%5Cleft%28z%5E2-1%5Cright%29%5E%7B%5Cfrac%7B%5Cmu%7D%7B2%7D%7D%7D%7B2%5E%5Cmu+%5Csqrt%7B%5Cpi%7D%5CGamma%5Cleft%28%5Cmu%2B%5Cfrac%7B1%7D%7B2%7D%5Cright%29%7D%5Cint_%7B-1%7D%5E1%5Cfrac%7B%5Cleft%281-t%5E2%5Cright%29%5E%7B%5Cmu+-%5Cfrac%7B1%7D%7B2%7D%7D%7D%7B%5Cleft%28z%2Bt%5Csqrt%7Bz%5E2-1%7D%5Cright%29%5E%7B%5Cmu-%5Cnu%7D%7Ddt&amp;fg=000000" 
>
```

If we squint real hard, we can break down `img src` into `$_GET` parameters:

`latex.php ? latex=<LaTeX> & fg=<ForegroundColor> & ...`

Such a URL returns a PNG containing math rendered by LaTeX.

# Hot Swap

Prior to the existence of this microservice, we called `wp.com/latex.php` for our math needs. _(Thanks WordPress!)_

Pressbooks users wanted a [MathJax](https://www.mathjax.org/) solution. 

MathJax's [CommonHTML output](http://docs.mathjax.org/en/latest/options/output-processors/CommonHTML.html) works great in webbooks, but not in PDFs, EPUBs, MOBIs, ...

Nowadays, Pressbooks uses CommonHTML output in webbooks, SVGs in PDFs, and PNGs in MOBI/EPUBs. 

The SVGs and PNGs are generated as follows:

## LaTeX

### PNG:

+ `http://localhost:3000/latex?latex=<LaTeX>`
+ Foreground color: `http://localhost:3000/latex?latex=<LaTeX>&fg=00ff00`
+ Font: `http://localhost:3000/latex?latex=<LaTeX>&font=Gyre-Pagella`
+ DPI: `http://localhost:3000/latex?latex=<LaTeX>&dpi=300`

Mix and match `fg=<RRGGBB>`, `font=<string>` and `dpi=<number>` as needed.

### SVG:

+ `http://localhost:3000/latex?latex=<LaTeX>&svg=1`
+ Foreground color: `http://localhost:3000/latex?latex=<LaTeX>&fg=00ff00&svg=1`
+ Font: `http://localhost:3000/latex?latex=<LaTeX>&font=Gyre-Pagella&svg=1`

Ie. same as PNG above with `svg=1` added. Because SVGs are vector images, DPI is not used.
 
## AsciiMath and MathML

Same as LaTeX above but instead of `latex?latex=<LaTeX>` do:

+ AsciiMath: `http://localhost:3000/asciimath?asciimath=<AsciiMath>` `...`
+ MathML: `http://localhost:3000/mathml?mathml=<MathML>` `...`

