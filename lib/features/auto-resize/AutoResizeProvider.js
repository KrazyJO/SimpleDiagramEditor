var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import RuleProvider from '../rules/RuleProvider';
/**
 * This is a base rule provider for the element.autoResize rule.
 */
var AutoResizeProvider = /** @class */ (function (_super) {
    __extends(AutoResizeProvider, _super);
    function AutoResizeProvider(eventBus) {
        var _this = _super.call(this, eventBus) || this;
        var self = _this;
        _this.addRule('element.autoResize', function (context) {
            return self.canResize(context.elements, context.target);
        });
        return _this;
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
}(RuleProvider));
export default AutoResizeProvider;
//# sourceMappingURL=AutoResizeProvider.js.map