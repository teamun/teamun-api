'use strict';

/**
 * Module dependencies.
 * Load all models andn routes
 * Save session in mongo
 */
var fs = require('fs'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  passport = require('passport'),
  mongoStore = require('connect-mongo')({
    session: session
  }),
  config = require('./config'),
  ErrorCode = require('../app/utils/enum/errorCode.js'),
  consolidate = require('consolidate'),
  path = require('path'),
  jwt = require('jwt-simple');

module.exports = function(db) {
  // Initialize express app
  var app = express();

  // Globbing model files
  config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
    require(path.resolve(modelPath));
  });

  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;

  // Passing the request url to environment locals
  app.use(function(req, res, next) {
    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
    next();
  });

  // Showing stack errors
  app.set('showStackError', true);

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // CookieParser should be above session
  app.use(cookieParser());

  // Express MongoDB session storage
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: new mongoStore({
      db: db.connection.db,
      collection: config.sessionCollection
    })
  }));

  // Use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // Use helmet to secure Express headers
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');

  // Exception handler
  app.use(require('express-domain-middleware'));

  // Check token middleware
  app.use(function(req, res, next) {
    // console.log(req.url);
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
    if (req.url === '/api/auth/sendsmscode' ||
        req.url === '/api/auth/checksmscode' ||
        req.url === '/api/auth/signup' ||
        req.url === '/api/auth/authenticate' ||
        req.url === '/api/auth/login' ||
        req.url === '/api/auth/resetpasswd' ||
        req.url === '/api/upload' ||
        req.url === '/api/cities' ||
        req.url === '/api/events' ||
        req.url === '/api/site/hots' ||
        req.url === '/api/mobile/hots' ||
        req.url.indexOf('/api/official-actions') > -1 ||
        req.url.indexOf('/api/site/official-actions') > -1 ||
        req.url.indexOf('/api/activities') > -1 ||
        req.url.indexOf('/api/site/activities') > -1 ||
        req.url.indexOf('/api/check-available-') > -1 ||
        req.url.indexOf('/api/wechats') > -1) {

        next();
    } else if (token) {
      // decode token
      // verifies secret and checks exp
      try {
        var decoded = jwt.decode(token, config.secret);

        if (decoded.exp <= Date.now()) {
          return res.json({
            ret: -1,
            code: ErrorCode.ACCESS_TOKEN_EXPIRED.code,
            msg: ErrorCode.ACCESS_TOKEN_EXPIRED.desc
          });
        }
        req.decoded = decoded;
        next();

      } catch (err) {
        return res.json({
          ret: -1,
          code: ErrorCode.ACCESS_TOKEN_AUTHENTICATE_FAILED.code,
          msg: ErrorCode.ACCESS_TOKEN_AUTHENTICATE_FAILED.desc
        });
      }
    } else {
      return res.json({
        ret: -1,
        code: ErrorCode.ACCESS_TOKEN_NO_PROVIDED.code,
        msg: ErrorCode.ACCESS_TOKEN_NO_PROVIDED.desc
      });
    }
  });

  // Globbing routing files
  config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
    require(path.resolve(routePath))(app);
  });

  // Catch exception use domains middleware way
  app.use(function errorHandler(err, req, res, next) {
    console.log('error on request %d %s %s', process.domain.id, req.method, req.url);
    console.log(err.stack);
    return res.json({
      ret: -1,
      code: 500,
      msg: err.stack
    });
    // if(err.domain) {
      //you should think about gracefully stopping & respawning your server
      //since an unhandled error might put your application into an unknown state
    // }
  });

  // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
  app.use(function(err, req, res, next) {
    // If the error object doesn't exists
    if (!err) return next();
    // Log it
    console.error(err.stack);
    // Error page
    return res.json({
      ret: -1,
      code: 500,
      msg: err.stack
    });
  });

  // Assume 404 since no middleware responded
  app.use(function(req, res) {
    return res.json({
      ret: -1,
      code: 404,
      msg: '404 Not Found'
    });
  });

  // Return Express server instance
  return app;
};
