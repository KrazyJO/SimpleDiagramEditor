import RuleProvider from '../rules/RuleProvider';
import inherits from 'inherits';
/**
 * This is a base rule provider for the element.autoResize rule.
 */
var AutoResizeProvider = /** @class */ (function () {
    function AutoResizeProvider(eventBus) {
        RuleProvider.call(this, eventBus);
        var self = this;
        this.addRule('element.autoResize', function (context) {
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
    AutoResizeProvider.prototype.canResize = function (elements, target) {
        return false;
    };
    ;
    AutoResizeProvider.$inject = ['eventBus'];
    return AutoResizeProvider;
}());
export default AutoResizeProvider;
inherits(AutoResizeProvider, RuleProvider);
//# sourceMappingURL=AutoResizeProvider.js.map