/* global sinon */

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import paletteModule from '@diagram-ts/features/palette';
import i18nModule from '@diagram-ts/i18n';

import { expect } from "chai";
const sinon = require('sinon');
var chai = require('chai');
chai.use(require('sinon-chai')); 

var spy = sinon.spy;


describe('i18n', function() {

  describe('events', function() {

    beforeEach(bootstrapDiagram({ modules: [ i18nModule ] }));


    it('should emit i18n.changed event', inject(function(i18n, eventBus) {

      // given
      var listener = spy(function() {});

      eventBus.on('i18n.changed', listener);

      // when
      i18n.changed();

      // then
      expect(listener).to.have.been.called;
    }));

  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({ modules: [ i18nModule, paletteModule ] }));


    it('should update palette', inject(function(palette, i18n) {

      // given
      var paletteUpdate = spy(palette, '_update');
      palette._init();

      // when
      i18n.changed();

      // then
      expect(paletteUpdate).to.have.been.called;
    }));

  });

});