'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const latexRouter = require('./routes/latex');
const asciiMathRouter = require('./routes/asciimath');
const mathMlRouter = require('./routes/mathml');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/latex', latexRouter);
app.use('/asciimath', asciiMathRouter);
app.use('/mathml', mathMlRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Store MathJax config as a global variable. If it changes we must call mjAPI.start()
app.locals.globalMathJaxConfig = null;
// Used to stop race conditions. Multiple calls to mjAPI.start(), at the same time, crashes MathJax in unexpected ways.
app.locals.globalMathJaxIsRestarting = false;

module.exports = app;
