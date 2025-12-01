# Synopsis

This is a replacement for `https://wp.com/latex.php`  but instead of LaTeX, it uses [MathJax](https://www.mathjax.org/).

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

## Base64 Encoded Formulas

You can now pass base64 encoded formulas to avoid URL encoding issues with complex mathematical expressions:

+ LaTeX: `http://localhost:3000/latex?latex=eF4yICsgeV4yID0gej4y&isBase64=true`
+ AsciiMath: `http://localhost:3000/asciimath?asciimath=c3VtXyhpPTEpXm4gaV4zPSgobihuKzEpKS8yKV4y&isBase64=true`
+ MathML: `http://localhost:3000/mathml?mathml=PG1hdGg-PG1pPng8L21pPjwvbWF0aD4&isBase64=true`

The `isBase64` parameter can be set to either `true` or `1`. For URL safety, the base64 encoded formulas above don't include padding characters (`==`).

### Base64 Encoding Examples

Here are some examples of formulas and their URL-safe base64 encoded versions (without padding):

| Formula | URL-safe Base64 Encoded |
|---------|----------------|
| `x^2 + y^2 = z^2` | `eF4yICsgeV4yID0gej4y` |
| `\frac{-b \pm \sqrt{b^2-4ac}}{2a}` | `XGZyYWN7LWIgXHBtIFxzcXJ0e2JeMi00YWN9fXsyYX0` |
| `\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}` | `XGludF8wXl5pbmZpbml0eSBlXnsteFxeMn0gZHggPSBcZnJhY3tcc3FydHtccGl9fXsyfQ` |

When encoding formulas for use with this service:
1. Convert your formula to base64
2. Replace any `+` with `-`
3. Replace any `/` with `_`
4. Remove any trailing `=` padding characters

### Example of Base64 Encoding in PHP

```php
function urlSafeBase64Encode($string) {
    $base64 = base64_encode($string);
    $urlSafe = strtr($base64, '+/', '-_');
    return rtrim($urlSafe, '='); // Remove padding
}

$formula = '\frac{-b \pm \sqrt{b^2-4ac}}{2a}';
$encodedFormula = urlSafeBase64Encode($formula);
$url = "http://localhost:3000/latex?latex={$encodedFormula}&isBase64=true";
```

### Example of Base64 Encoding in JavaScript

```javascript
function urlSafeBase64Encode(string) {
    const base64 = btoa(string);
    const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_');
    return urlSafe.replace(/=+$/, ''); // Remove padding
}

const formula = '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}';
const encodedFormula = urlSafeBase64Encode(formula);
const url = `http://localhost:3000/latex?latex=${encodedFormula}&isBase64=true`;
```

## Additional Rendering Parameters

You can now customize the rendering with these additional parameters:

+ `em`: Font size in pixels (default: 16)
+ `ex`: x-height in pixels (default: 8)
+ `width`: Container width in pixels (default: 1000)
+ `lineWidth`: Line width in pixels (default: 1000)
+ `scale`: Scaling factor (default: 1)

### Examples with Additional Parameters

+ Larger font size: `http://localhost:3000/latex?latex=x^2+y^2=z^2&em=24&ex=12`
+ Custom width: `http://localhost:3000/latex?latex=x^2+y^2=z^2&width=800&lineWidth=800`
+ Scaled formula: `http://localhost:3000/latex?latex=x^2+y^2=z^2&scale=1.5`
+ Combined parameters: `http://localhost:3000/latex?latex=x^2+y^2=z^2&em=20&scale=1.2&fg=0000ff&svg=1`

# Installation

Install Node.js 18.x LTS, Then:

    git clone git@github.com:pressbooks/pb-mathjax.git
    cd pb-mathjax
    npm install
    npm start

Finally, go to: `http://localhost:3000/`

## Deploy to a Production Server

Install [PM2](http://pm2.keymetrics.io/) on your server, then:

    cd ~/code/github/pressbooks/pb-mathjax
    npm install --only=prod
    pm2 start bin/www --name pb-mathjax

Pb-mathjax will be available at `http://YOURSERVER:3000/` and will run forever (or until you kill PM2.) Use in Pressbooks as the value for `PB_MATHJAX_URL`

More info: http://pm2.keymetrics.io/docs/usage/quick-start/


## Deploy to AWS Lambda

Install [Claudia.js](https://claudiajs.com/), then:

    cd ~/code/github/pressbooks/pb-mathjax
    claudia create --handler lambda.handler --deploy-proxy-api --region us-east-1 --timeout 15 --memory 256 --profile yourself --use-local-dependencies

Where `us-east-1` is your AWS region and `yourself` corresponds to an identity in your `~/.aws/credentials` file.

If everything goes well, the above command will finish after a few moments and print a response with a URL. Use in Pressbooks as the value for `PB_MATHJAX_URL`

More info: https://claudiajs.com/tutorials/installing.html https://github.com/claudiajs/claudia/blob/master/docs/

If you are deploying not for the first time, use

```
rm -rf node_modules package-lock.json
npm install --arch=x64 --platform=linux
claudia update --use-local-dependencies
```

This will download the dependencies needed for Linux and deploy to AWS Lambda.


### Automated Deploy Pipeline
This service is deployed automatically through AWS CodePipeline. Updates to the development, staging, or production branches trigger the pipeline to fetch the latest code, build and test it, and deploy the resulting ZIP package to the Lambda function. Deployment start and completion notifications are sent to the Slack bots channel.

For more details, see the Terraform directory.
