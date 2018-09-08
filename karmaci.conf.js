'use strict';

process.env.CHROME_BIN = require('puppeteer').executablePath();

/* global process */
var browsers = ['ChromeHeadless_Linux'];
var webpackCongig = require('./webpack.config');

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/spec/diagram-ts/layout/CroppingConnectionDockingSpec.ts'
    ],

    preprocessors: {
      'test/**/*.ts': [ 'webpack', 'sourcemap' ]
    },
    typescriptPreprocessor: {
      // options passed to the typescript compiler
      options: {
        // relative path to tsconfig
        project: 'tsconfig.json'
      }
    },
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json',
    },

    webpack : {
      module : webpackCongig.module,
      resolve : webpackCongig.resolve,
      devtool: 'inline-source-map',
      node: {
        fs: 'empty'
      }
    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
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
          '--disable-gpu'
        ]
      }
    },

    autoWatch: true,
    singleRun: true

  });
};
