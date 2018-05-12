import { forEach } from 'min-dash';


import {
	add as collectionAdd,
	remove as collectionRemove
} from '../../../util/Collections';
import { Point } from '../../../../interfaces';


/**
 * A handler that implements reversible moving of connections.
 *
 * The handler differs from the layout connection handler in a sense
 * that it preserves the connection layout.
 */
export default class MoveConnectionHandler {


	public execute(context : any) : any {

		var connection = context.connection,
			delta = context.delta;

		var newParent = context.newParent || connection.parent,
			newParentIndex = context.newParentIndex,
			oldParent = connection.parent;

		// save old parent in context
		context.oldParent = oldParent;
		context.oldParentIndex = collectionRemove(oldParent.children, connection);

		// add to new parent at position
		collectionAdd(newParent.children, connection, newParentIndex);

		// update parent
		connection.parent = newParent;

		// update waypoint positions
		forEach(connection.waypoints, function (p : Point) {
			p.x += delta.x;
			p.y += delta.y;

			if (p.original) {
				p.original.x += delta.x;
				p.original.y += delta.y;
			}
		});

		return connection;
	};

	public revert(context : any) : any {

		var connection = context.connection,
			newParent = connection.parent,
			oldParent = context.oldParent,
			oldParentIndex = context.oldParentIndex,
			delta = context.delta;

		// remove from newParent
		collectionRemove(newParent.children, connection);

		// restore previous location in old parent
		collectionAdd(oldParent.children, connection, oldParentIndex);

		// restore parent
		connection.parent = oldParent;

		// revert to old waypoint positions
		forEach(connection.waypoints, function (p : Point) {
			p.x -= delta.x;
			p.y -= delta.y;

			if (p.original) {
				p.original.x -= delta.x;
				p.original.y -= delta.y;
			}
		});

		return connection;
	};

}


