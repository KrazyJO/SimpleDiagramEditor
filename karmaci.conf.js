'use strict';

process.env.CHROME_BIN = require('puppeteer').executablePath();

/* global process */

// var browsers = ['ChromeDebugging'];
var browsers = ['ChromeHeadlessDebugging'];

var webpackCongig = require('./webpack.config');

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/spec/**/*Spec.ts'
    ],

    preprocessors: {
      'test/**/*.ts': [ 'webpack', 'sourcemap' ]
    },

    webpack : {
      module : webpackCongig.module,
      resolve : webpackCongig.resolve,
      devtool: 'inline-source-map',
      node: {
        fs: 'empty'
      }
    },
    mime: {
      'text/x-typescript': ['ts']
    },

    reporters: [ 'spec' ],

    browsers: browsers,

    browserNoActivityTimeout: 30000,

    customLaunchers: {
      ChromeHeadless_Linux: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--remote-debugging-port=9333'
        ],
        debug: true
      },
      ChromeDebugging: {
        base: 'Chrome',
        flags: [ '--remote-debugging-port=9333' ]
      },
      ChromeHeadlessDebugging: {
        base: 'ChromeHeadless',
        flags: [ '--remote-debugging-port=9333' ]
      }
    },

    autoWatch: true,
    singleRun: true

  });
};
