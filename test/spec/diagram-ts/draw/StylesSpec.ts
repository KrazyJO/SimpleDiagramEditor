import Styles from '@diagram-ts/draw/Styles';

import { expect } from "chai";
var chai = require('chai');
chai.use(require('sinon-chai')); 

describe('draw/Styles', function() {

  var styles = new Styles();

  describe('#cls', function() {

    it('should create style with traits given', function() {

      // given
      var expectedStyle = {
        'class': 'foo',
        'fill': 'none'
      };

      // when
      var style = styles.cls('foo', [ 'no-fill' ]);

      // then
      expect(style).to.eql(expectedStyle);
    });


    it('should create style without traits given', function() {

      // given
      var expectedStyle = {
        'class': 'foo',
        'fill': 'none'
      };

      // when
      var style = styles.cls('foo', { fill: 'none' });

      // then
      expect(style).to.eql(expectedStyle);
    });

  });

});
