import RuleProvider from '../rules/RuleProvider';

import inherits from 'inherits';
import EventBus from '../../core/EventBus';

/**
 * This is a base rule provider for the element.autoResize rule.
 */
export default class AutoResizeProvider {

  public static $inject = ['eventBus'];

  constructor(eventBus: EventBus) {
    RuleProvider.call(this, eventBus);

    var self = this;

    this.addRule('element.autoResize', function (context: any) {
      return self.canResize(context.elements, context.target);
    });
  }

  /**
 * Needs to be implemented by sub classes to allow actual auto resize
 *
 * @param  {Array<djs.model.Shape>} elements
 * @param  {djs.model.Shape} target
 *
 * @return {Boolean}
 */
  public canResize(elements: any[], target: any): boolean {
    return false;
  };

}


inherits(AutoResizeProvider, RuleProvider);

