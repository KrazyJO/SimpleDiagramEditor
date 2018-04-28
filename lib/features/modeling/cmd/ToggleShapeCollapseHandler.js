/**
 * A handler that toggles the collapsed state of an element
 * and the visibility of all its children.
 *
 * @param {Modeling} modeling
 */
var ToggleShapeCollapseHandler = /** @class */ (function () {
    function ToggleShapeCollapseHandler(modeling) {
        this._modeling = modeling;
    }
    ToggleShapeCollapseHandler.prototype.execute = function (context) {
        var shape = context.shape, children = shape.children;
        // remember previous visibility of children
        context.oldChildrenVisibility = getElementsVisibility(children);
        // toggle state
        shape.collapsed = !shape.collapsed;
        // hide/show children
        setHidden(children, shape.collapsed);
        return [shape].concat(children);
    };
    ;
    ToggleShapeCollapseHandler.prototype.revert = function (context) {
        var shape = context.shape, oldChildrenVisibility = context.oldChildrenVisibility;
        var children = shape.children;
        // set old visability of children
        restoreVisibility(children, oldChildrenVisibility);
        // retoggle state
        shape.collapsed = !shape.collapsed;
        return [shape].concat(children);
    };
    ;
    ToggleShapeCollapseHandler.$inject = ['modeling'];
    return ToggleShapeCollapseHandler;
}());
export default ToggleShapeCollapseHandler;
// helpers //////////////////////
/**
 * Return a map { elementId -> hiddenState}.
 *
 * @param {Array<djs.model.Shape>} elements
 *
 * @return {Object}
 */
function getElementsVisibility(elements) {
    var result = {};
    elements.forEach(function (e) {
        result[e.id] = e.hidden;
    });
    return result;
}
function setHidden(elements, newHidden) {
    elements.forEach(function (element) {
        element.hidden = newHidden;
    });
}
function restoreVisibility(elements, lastState) {
    elements.forEach(function (e) {
        e.hidden = lastState[e.id];
    });
}
//# sourceMappingURL=ToggleShapeCollapseHandler.js.map