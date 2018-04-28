import {
	add as collectionAdd,
	indexOf as collectionIdx
} from '../../../util/Collections';
import Canvas from '../../../core/Canvas';
import Modeling from '../Modeling';


/**
 * A handler that implements reversible deletion of Connections.
 *
 */
export default class DeleteConnectionHandler {

	private _canvas: Canvas;
	private _modeling: Modeling;

	public static $inject = [
		'canvas',
		'modeling'
	];

	constructor(canvas: Canvas, modeling: Modeling) {
		this._canvas = canvas;
		this._modeling = modeling;
	}

	/**
   * - Remove attached label
   */
	public preExecute(context: any): void {

		var connection = context.connection;

		// Remove label
		if (connection.label) {
			this._modeling.removeShape(connection.label);
		}
	};

	public execute(context: any): any {

		var connection = context.connection,
			parent = connection.parent;

		context.parent = parent;
		context.parentIndex = collectionIdx(parent.children, connection);

		context.source = connection.source;
		context.target = connection.target;

		this._canvas.removeConnection(connection);

		connection.source = null;
		connection.target = null;
		connection.label = null;

		return connection;
	};

	/**
	 * Command revert implementation.
	 */
	public revert(context: any): any {

		var connection = context.connection,
			parent = context.parent,
			parentIndex = context.parentIndex;

		connection.source = context.source;
		connection.target = context.target;

		// restore previous location in old parent
		collectionAdd(parent.children, connection, parentIndex);

		this._canvas.addConnection(connection, parent);

		return connection;
	};

}



