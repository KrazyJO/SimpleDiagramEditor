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
      'test/spec/DiagramSpec.js',
      // 'test/spec/util/AttachUtilSpec.js',
      // 'test/spec/util/CopyPasteUtil.js',
      // 'test/spec/util/ElementIntegrationSpec.js',
      // 'test/spec/util/ElementsSpec.js',
      // 'test/spec/util/GeometrySpec.js',
      // 'test/spec/util/IdGeneratorSpec.js',
      // 'test/spec/util/LineIntersectionSpec.js',
      // 'test/spec/util/TextSpec.js',
      // 'test/spec/transformer/JsonToXmlSpec.js',
      // 'test/spec/transformer/Diagram2JsonTransformerSpec.js'
      'test/spec/core/*Spec.ts'
      // ,
      // 'test/spec/command/*Spec.ts',
      // 'test/spec/draw/*Spec.ts',
      // 'test/spec/environment/*Spec.ts'
    ],

    preprocessors: {
      'test/**/*.js': [ 'webpack', 'sourcemap' ],
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
    // singleRun: true,

  });
};
