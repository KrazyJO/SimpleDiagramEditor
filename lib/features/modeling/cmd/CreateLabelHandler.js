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
import CreateShapeHandler from './CreateShapeHandler';
var originalExecute = CreateShapeHandler.prototype.execute;
var originalRevert = CreateShapeHandler.prototype.revert;
/**
 * A handler that attaches a label to a given target shape.
 *
 * @param {Canvas} canvas
 */
var CreateLabelHandler = /** @class */ (function (_super) {
    __extends(CreateLabelHandler, _super);
    function CreateLabelHandler(canvas) {
        return _super.call(this, canvas) || this;
        // CreateShapeHandler.call(this, canvas);
    }
    /**
 * Appends a label to a target shape.
 *
 * @method CreateLabelHandler#execute
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.target the element the label is attached to
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} context.position position of the new element
 */
    CreateLabelHandler.prototype.execute = function (context) {
        var label = context.shape;
        ensureValidDimensions(label);
        label.labelTarget = context.labelTarget;
        return originalExecute.call(this, context);
    };
    ;
    /**
     * Undo append by removing the shape
     */
    CreateLabelHandler.prototype.revert = function (context) {
        context.shape.labelTarget = null;
        return originalRevert.call(this, context);
    };
    ;
    CreateLabelHandler.$inject = ['canvas'];
    return CreateLabelHandler;
}(CreateShapeHandler));
export default CreateLabelHandler;
function ensureValidDimensions(label) {
    // make sure a label has valid { width, height } dimensions
    ['width', 'height'].forEach(function (prop) {
        if (typeof label[prop] === 'undefined') {
            label[prop] = 0;
        }
    });
}
//# sourceMappingURL=CreateLabelHandler.js.map