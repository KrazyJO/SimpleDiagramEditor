import { some } from 'min-dash';

/**
 * A handler that implements reversible appending of shapes
 * to a source shape.
 *
 * @param {canvas} Canvas
 * @param {elementFactory} ElementFactory
 * @param {modeling} Modeling
 */
export default class AppendShapeHandler {

	public static $inject = ['modeling'];
	private _modeling: any;

	constructor(modeling: any) {
		this._modeling = modeling;

	}

	// api //////////////////////


	/**
	 * Creates a new shape
	 *
	 * @param {Object} context
	 * @param {ElementDescriptor} context.shape the new shape
	 * @param {ElementDescriptor} context.source the source object
	 * @param {ElementDescriptor} context.parent the parent object
	 * @param {Point} context.position position of the new element
	 */
	public preExecute(context: any) {

		var source = context.source;

		if (!source) {
			throw new Error('source required');
		}

		var target = context.target || source.parent,
			shape = context.shape;

		shape = context.shape =
			this._modeling.createShape(
				shape,
				context.position,
				target, { attach: context.attach });

		context.shape = shape;
	};

	public postExecute(context: any) {
		var parent = context.connectionParent || context.shape.parent;

		if (!existsConnection(context.source, context.shape)) {

			// create connection
			this._modeling.connect(context.source, context.shape, context.connection, parent);
		}
	};

}

function existsConnection(source: any, target: any): any {
	return some(source.outgoing, function (c: any) {
		return c.target === target;
	});
}
