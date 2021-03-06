import {
  isFunction,
  forEach,
  merge
} from 'min-dash';

import TestContainer from 'mocha-test-container-support';

import Diagram from '@diagram-ts/Diagram';
// import { event as domEvent } from 'min-dom';
var domEvent = require('min-dom').event;

var OPTIONS, DIAGRAM_JS;


/**
 * Bootstrap the diagram given the specified options and a number of locals (i.e. services)
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapDiagram(function() {
 *     mockEvents = new Events();
 *
 *     return {
 *       events: mockEvents
 *     };
 *   }));
 *
 * });
 *
 * @param  {Object} (options) optional options to be passed to the diagram upon instantiation
 * @param  {Object|Function} locals  the local overrides to be used by the diagram or a function that produces them
 * @return {Function}         a function to be passed to beforeEach
 */
export function bootstrapDiagram(options?, locals?) {

  return function() {

    var testContainer;


    // Make sure the test container is an optional dependency and we fall back
    // to an empty <div> if it does not exist.
    //
    // This is needed if other libraries rely on this helper for testing
    // while not adding the mocha-test-container-support as a dependency.
    try {
      testContainer = TestContainer.get(this);
    } catch (e) {
      testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
    }

    testContainer.classList.add('test-container');


    var _options = options,
        _locals = locals;

    if (!_locals && isFunction(_options)) {
      _locals = _options;
      _options = null;
    }

    if (isFunction(_options)) {
      _options = _options();
    }

    if (isFunction(_locals)) {
      _locals = _locals();
    }

    _options = merge({
      canvas: {
        container: testContainer,
        deferUpdate: false
      }
    }, OPTIONS, _options);


    var mockModule = {};

    forEach(_locals, function(v, k) {
      mockModule[k] = ['value', v];
    });

    _options.modules = [].concat(_options.modules || [], [ mockModule ]);

    // remove previous instance
    cleanup();

    DIAGRAM_JS = new Diagram(_options);
  };
}

/**
 * Injects services of an instantiated diagram into the argument.
 *
 * Use it in conjunction with {@link #bootstrapDiagram}.
 *
 * @example
 *
 * describe(function() {
 *
 *   var mockEvents;
 *
 *   beforeEach(bootstrapDiagram(...));
 *
 *   it('should provide mocked events', inject(function(events) {
 *     expect(events).toBe(mockEvents);
 *   }));
 *
 * });
 *
 * @param  {Function} fn the function to inject to
 * @return {Function} a function that can be passed to it to carry out the injection
 */
export function inject(fn) {
  return function() {

    if (!DIAGRAM_JS) { 
      throw new Error('no bootstraped diagram, ensure you created it via #bootstrapDiagram');
    }
    var inv = DIAGRAM_JS.invoke(fn);
    return inv;
  };
}

function cleanup() {
  if (!DIAGRAM_JS) {
    return;
  }

  DIAGRAM_JS.destroy();
}


export function insertCSS(name, css) {
  if (document.querySelector('[data-css-file="' + name + '"]')) {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0],
      style : any = document.createElement('style');
  style.setAttribute('data-css-file', name);

  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

export function getDiagramJS() {
  return DIAGRAM_JS;
}

function DomEventTracker() {

  this.install = function() {

    domEvent.__bind = domEvent.bind;
    domEvent.__unbind = domEvent.__unbind || domEvent.unbind;

    domEvent.bind = function(el, type, fn, capture) {
      el.$$listenerCount = (el.$$listenerCount || 0) + 1;
      return domEvent.__bind(el, type, fn, capture);
    };

    domEvent.unbind = function(el:any, type, fn, capture) {
      el.$$listenerCount = (el.$$listenerCount || 0) -1;
      return domEvent.__unbind(el, type, fn, capture);
    };
  };

  this.uninstall = function() {
    domEvent.bind = domEvent.__bind;
    domEvent.unbind = domEvent.__unbind;
  };
}


export var DomMocking = new DomEventTracker();