//---------------------IMPORTS---------------------
import BaseLayouter from '../../diagram-ts/layout/BaseLayouter';
import { getMid } from '../../diagram-ts/layout/LayoutUtil';

//---------------------CLASS--------------------
export default class EasyLayouter extends BaseLayouter {

	//---------------------METHODS---------------------
	layoutConnection(connection, hints) {
		hints = hints || {};
		const source = connection.source;
		const target = connection.target;
		const waypoints = connection.waypoints;
		let start = hints.connectionStart;
		let end = hints.connectionEnd;
		if (!start) {
			start = this.getConnectionDocking(waypoints && waypoints[0], source);
		}
		if (!end) {
			end = this.getConnectionDocking(waypoints && waypoints[waypoints.length - 1], target);
		}
		return [start, end];
	}

	private getConnectionDocking(point, shape) {
		return point ? (point.original || point) : getMid(shape);
	}
}
