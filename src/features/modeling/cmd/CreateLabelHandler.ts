import CreateShapeHandler from './CreateShapeHandler';
import Canvas from '../../../core/Canvas';


let originalExecute = CreateShapeHandler.prototype.execute;
let originalRevert = CreateShapeHandler.prototype.revert;

/**
 * A handler that attaches a label to a given target shape.
 *
 * @param {Canvas} canvas
 */
export default class CreateLabelHandler extends CreateShapeHandler {

	public static $inject = ['canvas'];

	constructor(canvas: Canvas) {
		super(canvas)
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
	public execute(context: any) {

		var label = context.shape;

		ensureValidDimensions(label);

		label.labelTarget = context.labelTarget;

		return originalExecute.call(this, context);
	};

	/**
	 * Undo append by removing the shape
	 */
	public revert(context: any) {
		context.shape.labelTarget = null;

		return originalRevert.call(this, context);
	};


}

function ensureValidDimensions(label: any) {
	// make sure a label has valid { width, height } dimensions
	['width', 'height'].forEach(function (prop) {
		if (typeof label[prop] === 'undefined') {
			label[prop] = 0;
		}
	});
}