'use strict';

var path = require('path');

var absoluteBasePath = path.resolve(__dirname);

/* global process */

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers =
  (process.env.TEST_BROWSERS || 'PhantomJS')
    .replace(/^\s+|\s+$/, '')
    .split(/\s*,\s*/g)
    .map(function(browser) {
      if (browser === 'ChromeHeadless') {
        process.env.CHROME_BIN = require('puppeteer').executablePath();

        // workaround https://github.com/GoogleChrome/puppeteer/issues/290
        if (process.platform === 'linux') {
          return 'ChromeHeadless_Linux';
        }
      }

      return browser;
    });

var webpackCongig = require('./webpack.config');

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/spec/DiagramSpec.js',
      'test/spec/util/AttachUtilSpec.js',
      'test/spec/util/CopyPasteUtil.js',
      'test/spec/util/ElementIntegrationSpec.js',
      'test/spec/util/ElementsSpec.js',
      'test/spec/util/GeometrySpec.js',
      'test/spec/util/IdGeneratorSpec.js',
      'test/spec/util/LineIntersectionSpec.js',
      'test/spec/util/TextSpec.js',
      'test/spec/command/CommandInterceptorSpec.js'
    ],

    preprocessors: {
      'test/**/*.*': [ 'webpack' ]
    },

    webpack : {
      module : webpackCongig.module,
      resolve : webpackCongig.resolve,
      node: {
        fs: 'empty'
      }
    },

    reporters: [ 'spec' ],

    browsers: browsers,

    browserNoActivityTimeout: 30000,

    customLaunchers: {
      ChromeHeadless_Linux: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        debug: true
      }
    },

    autoWatch: false,
    singleRun: true,

  });
};
