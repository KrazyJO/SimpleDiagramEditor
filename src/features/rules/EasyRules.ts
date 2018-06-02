//---------------------IMPORTS---------------------
// import  RuleProvider = require('diagram-js/lib/features/rules/RuleProvider');
import RuleProvider from '../../diagram-ts/features/rules/RuleProvider';
// import { Root } from 'diagram-js/lib/model/index';
// import {Root} from '../../diagram-ts/model/index';
import { is } from '@utils/ModelUtil';

//---------------------STATIC---------------------
function notMoveOnItself(shapes, target): boolean {
  while (target) {
    if (shapes.indexOf(target) !== -1) {
      return false;
    }
    target = target.parent;
  }
  return true;
}

function notMoveLable(shapes, target): boolean {
  return target.type !== 'label';
}

function canResize(shape, newBounds) {
  if (is(shape, 'sde:Edge')) {
    return false;
  }
  return !newBounds || (newBounds.width >= 50 && newBounds.height >= 50);
}

//---------------------CLASS--------------------
export default class EasyRules extends RuleProvider {

  //---------------------CONSTRUCTOR---------------------
  constructor(evenBus) {
    super(evenBus);
  }

  //---------------------METHODS---------------------
  init() {
    this.addRule('elements.move', (context) => {
      const target = context.target;
      const shapes = context.shapes;
      // const position = context.position;
      return !target || (notMoveOnItself(shapes, target) && notMoveLable(shapes, target));
    });
    this.addRule('shape.resize', (context) => {
      const shape = context.shape;
      const newBounds = context.newBounds;
      return canResize(shape, newBounds);
    });
  }

  canConnect(source, target): any {
    if (target !== source && ( is(target, 'sde:Node'))) {
      return { type: 'sde:Edge'};
    }
    else {
      return false;
    }
  }
}

(EasyRules as any).$inject = ['eventBus'];
