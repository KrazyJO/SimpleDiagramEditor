import IdGenerator from '@diagram-ts/util/IdGenerator';

import { expect } from "chai";
var chai = require('chai');
chai.use(require('sinon-chai')); 


describe('util/IdGenerator', function() {


  it('should configure with prefix', function() {

    // when
    var foos = new IdGenerator('foo');

    // then
    expect(foos.next()).to.match(/^foo-(\d+)-1$/);
    expect(foos.next()).to.match(/^foo-(\d+)-2$/);
    expect(foos.next()).to.match(/^foo-(\d+)-3$/);
  });


  it('should configure without prefix', function() {

    // when
    var foos : any = new IdGenerator();

    // then
    expect(foos._prefix).to.exist;

    expect(foos.next()).to.match(/^(\d+)-1$/);
    expect(foos.next()).to.match(/^(\d+)-2$/);
    expect(foos.next()).to.match(/^(\d+)-3$/);

  });

});
