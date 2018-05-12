import Canvas from "../../../core/Canvas";

export default class CreateConnectionHandler {

	public _canvas: Canvas;
	public _layouter: any;
	public static $inject = ['canvas', 'layouter'];

	constructor(canvas: Canvas, layouter: any) {
		this._canvas = canvas;
		this._layouter = layouter;
	}

	// api //////////////////////


	/**
	 * Appends a shape to a target shape
	 *
	 * @param {Object} context
	 * @param {djs.element.Base} context.source the source object
	 * @param {djs.element.Base} context.target the parent object
	 * @param {Point} context.position position of the new element
	 */
	public execute(context : any) : void {

		var connection = context.connection,
			source = context.source,
			target = context.target,
			parent = context.parent,
			parentIndex = context.parentIndex,
			hints = context.hints;

		if (!source || !target) {
			throw new Error('source and target required');
		}

		if (!parent) {
			throw new Error('parent required');
		}

		connection.source = source;
		connection.target = target;

		if (!connection.waypoints) {
			connection.waypoints = this._layouter.layoutConnection(connection, hints);
		}

		// add connection
		this._canvas.addConnection(connection, parent, parentIndex);

		return connection;
	};

	public revert(context : any) : void {
		var connection = context.connection;

		this._canvas.removeConnection(connection);

		connection.source = null;
		connection.target = null;
	};
}



