import { assign } from 'min-dash';
import BaseLayouter from '../../../layout/BaseLayouter';
import Canvas from '../../../core/Canvas';


/**
 * A handler that implements reversible moving of shapes.
 */
export default class LayoutConnectionHandler {

	public static $inject = ['layouter', 'canvas'];

	private _layouter: BaseLayouter;
	public _canvas: Canvas;

	constructor(layouter: BaseLayouter, canvas: Canvas) {
		this._layouter = layouter;
		this._canvas = canvas;

	}

	public execute(context: any): any {

		var connection = context.connection;

		var oldWaypoints = connection.waypoints;

		assign(context, {
			oldWaypoints: oldWaypoints
		});

		connection.waypoints = this._layouter.layoutConnection(connection, context.hints);

		return connection;
	};

	public revert(context: any): any {

		var connection = context.connection;

		connection.waypoints = context.oldWaypoints;

		return connection;
	};


}


