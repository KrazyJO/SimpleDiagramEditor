import * as CopyPasteUtil from '@diagram-ts/util/CopyPasteUtil';

import { expect } from "chai";
var chai = require('chai');
chai.use(require('sinon-chai')); 


describe('util/CopyPasteUtil', function() {

  describe('#getTopLevel', function() {

    var sA = { id: 'a', parent: { id: 'root' } },
        sB = { id: 'b', parent: sA },
        sC = { id: 'c', parent: sA },
        sE = { id: 'e', parent: sA },
        sD = { id: 'd', parent: { id: 'b' } },
        sF = { id: 'f', parent: { id: 'e' } },
        sG = { id: 'g', parent: { id: 'f' } },
        sX : any = { id: 'x', parent: { id: 'y' } };


    it('should only get the top level', function() {
      // when
      var topLevel = CopyPasteUtil.getTopLevel([ sA, sB, sC, sE, sD, sG, sF, sX ]);

      // then
      expect(topLevel).to.contain(sA, sX);
      expect(topLevel.length).to.equal(2);
    });

  });

});
