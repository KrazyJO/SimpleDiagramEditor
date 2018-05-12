import {
	add as collectionAdd,
	indexOf as collectionIdx
} from '../../../util/Collections';

import { saveClear } from '../../../util/Removal';
import Canvas from '../../../core/Canvas';
import Modeling from '../Modeling';


/**
 * A handler that implements reversible deletion of shapes.
 *
 */
export default class DeleteShapeHandler {

	private _canvas: Canvas;
	private _modeling: Modeling;

	public static $inject = ['canvas', 'modeling'];

	constructor(canvas: Canvas, modeling: Modeling) {
		this._canvas = canvas;
		this._modeling = modeling;
	}

	/**
	 * - Remove connections
	 * - Remove all direct children
	 */
	public preExecute(context: any) {

		var modeling = this._modeling;

		var shape = context.shape,
			label = shape.label;

		// Clean up on removeShape(label)
		if (shape.labelTarget) {
			context.labelTarget = shape.labelTarget;
			shape.labelTarget = null;
		}

		// Remove label
		if (label) {
			this._modeling.removeShape(label, { nested: true });
		}

		// remove connections
		saveClear(shape.incoming, function (connection: any): void {
			// To make sure that the connection isn't removed twice
			// For example if a container is removed
			modeling.removeConnection(connection, { nested: true });
		});

		saveClear(shape.outgoing, function (connection: any): void {
			modeling.removeConnection(connection, { nested: true });
		});

		// remove child shapes and connections
		saveClear(shape.children, function (child: any): void {
			if (isConnection(child)) {
				modeling.removeConnection(child, { nested: true });
			} else {
				modeling.removeShape(child, { nested: true });
			}
		});
	};

	/**
	 * Remove shape and remember the parent
	 */
	public execute(context: any): any {
		var canvas = this._canvas;

		var shape = context.shape,
			oldParent = shape.parent;

		context.oldParent = oldParent;
		context.oldParentIndex = collectionIdx(oldParent.children, shape);

		shape.label = null;

		canvas.removeShape(shape);

		return shape;
	};


	/**
	 * Command revert implementation
	 */
	public revert(context: any): any {

		var canvas = this._canvas;

		var shape = context.shape,
			oldParent = context.oldParent,
			oldParentIndex = context.oldParentIndex,
			labelTarget = context.labelTarget;

		// restore previous location in old oldParent
		collectionAdd(oldParent.children, shape, oldParentIndex);

		if (labelTarget) {
			labelTarget.label = shape;
		}

		canvas.addShape(shape, oldParent);

		return shape;
	};
}


function isConnection(element : any) {
	return element.waypoints;
}
