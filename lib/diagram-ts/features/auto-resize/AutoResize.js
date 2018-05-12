// import inherits from 'inherits';
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
import { getBBox as getBoundingBox } from '../../util/Elements';
import { asTRBL, asBounds } from '../../layout/LayoutUtil';
import { assign, flatten, forEach, values, groupBy } from 'min-dash';
import CommandInterceptor from '../../command/CommandInterceptor';
/**
 * An auto resize component that takes care of expanding a parent element
 * if child elements are created or moved close the parents edge.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Modeling} modeling
 * @param {Rules} rules
 */
var AutoResize = /** @class */ (function (_super) {
    __extends(AutoResize, _super);
    function AutoResize(eventBus, elementRegistry, modeling, rules) {
        var _this = _super.call(this, eventBus) || this;
        /**
         * Perform the actual resize operation.
         *
         * @param {djs.model.Shape} target
         * @param {Object} newBounds
         */
        _this.resize = function (target, newBounds) {
            this._modeling.resizeShape(target, newBounds);
        };
        // CommandInterceptor.call(this, eventBus);
        _this._elementRegistry = elementRegistry;
        _this._modeling = modeling;
        _this._rules = rules;
        var self = _this;
        //postExecusted will be injected by CommandInterceptor
        _this.postExecuted(['shape.create'], function (event) {
            var context = event.context, hints = context.hints, shape = context.shape, parent = context.parent || context.newParent;
            if (hints && hints.root === false) {
                return;
            }
            self._expand([shape], parent);
        });
        _this.postExecuted(['elements.move'], function (event) {
            var context = event.context, elements = flatten(values(context.closure.topLevel)), hints = context.hints;
            if (hints && hints.autoResize === false) {
                return;
            }
            var expandings = groupBy(elements, function (element) {
                return element.parent.id;
            });
            forEach(expandings, function (elements, parentId) {
                self._expand(elements, parentId);
            });
        });
        return _this;
    }
    /**
   * Calculate the new bounds of the target shape, given
   * a number of elements have been moved or added into the parent.
   *
   * This method considers the current size, the added elements as well as
   * the provided padding for the new bounds.
   *
   * @param {Array<djs.model.Shape>} elements
   * @param {djs.model.Shape} target
   */
    AutoResize.prototype._getOptimalBounds = function (elements, target) {
        var offset = this.getOffset(target), padding = this.getPadding(target);
        var elementsTrbl = asTRBL(getBoundingBox(elements)), targetTrbl = asTRBL(target);
        var newTrbl = {};
        if (elementsTrbl.top - targetTrbl.top < padding.top) {
            newTrbl.top = elementsTrbl.top - offset.top;
        }
        if (elementsTrbl.left - targetTrbl.left < padding.left) {
            newTrbl.left = elementsTrbl.left - offset.left;
        }
        if (targetTrbl.right - elementsTrbl.right < padding.right) {
            newTrbl.right = elementsTrbl.right + offset.right;
        }
        if (targetTrbl.bottom - elementsTrbl.bottom < padding.bottom) {
            newTrbl.bottom = elementsTrbl.bottom + offset.bottom;
        }
        return asBounds(assign({}, targetTrbl, newTrbl));
    };
    ;
    /**
     * Expand the target shape respecting rules, offset and padding
     *
     * @param {Array<djs.model.Shape>} elements
     * @param {djs.model.Shape|String} target|targetId
     */
    AutoResize.prototype._expand = function (elements, target) {
        if (typeof target === 'string') {
            target = this._elementRegistry.get(target);
        }
        var allowed = this._rules.allowed('element.autoResize', {
            elements: elements,
            target: target
        });
        if (!allowed) {
            return;
        }
        // calculate the new bounds
        var newBounds = this._getOptimalBounds(elements, target);
        if (!boundsChanged(newBounds, target)) {
            return;
        }
        // resize the parent shape
        this.resize(target, newBounds);
        var parent = target.parent;
        // recursively expand parent elements
        if (parent) {
            this._expand([target], parent);
        }
    };
    ;
    /**
     * Get the amount to expand the given shape in each direction.
     *
     * @param {djs.model.Shape} shape
     *
     * @return {Object} {top, bottom, left, right}
     */
    AutoResize.prototype.getOffset = function (shape) {
        return { top: 60, bottom: 60, left: 100, right: 100 };
    };
    ;
    /**
     * Get the activation threshold for each side for which
     * resize triggers.
     *
     * @param {djs.model.Shape} shape
     *
     * @return {Object} {top, bottom, left, right}
     */
    AutoResize.prototype.getPadding = function (shape) {
        return { top: 2, bottom: 2, left: 15, right: 15 };
    };
    ;
    AutoResize.$inject = [
        'eventBus',
        'elementRegistry',
        'modeling',
        'rules'
    ];
    return AutoResize;
}(CommandInterceptor));
export default AutoResize;
function boundsChanged(newBounds, oldBounds) {
    return (newBounds.x !== oldBounds.x ||
        newBounds.y !== oldBounds.y ||
        newBounds.width !== oldBounds.width ||
        newBounds.height !== oldBounds.height);
}
//# sourceMappingURL=AutoResize.js.map