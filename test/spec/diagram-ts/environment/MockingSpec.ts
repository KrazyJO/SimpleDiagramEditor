import {
  bootstrapDiagram,
  inject
} from '@test/TestHelper';


import EventBus from '@diagram-ts/core/EventBus';

import { expect } from "chai";
var chai = require('chai');
chai.use(require('sinon-chai')); 


describe('environment/Mocking', function() {

  var mockEventBus, bootstrapCalled;


  beforeEach(bootstrapDiagram(function() {
    mockEventBus = new EventBus();

    bootstrapCalled = true;

    return {
      eventBus: mockEventBus
    };
  }));

  afterEach(function() {
    bootstrapCalled = false;
  });


  it('should use spy', inject(function(eventBus) {
    expect(eventBus).to.equal(mockEventBus);
    expect(bootstrapCalled).to.equal(true);
  }));


  it('should reparse bootstrap code', inject(function(eventBus) {
    expect(bootstrapCalled).to.equal(true);
  }));

});