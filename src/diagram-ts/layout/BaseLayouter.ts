import {
	getMid
} from './LayoutUtil';
import { Connection } from '../model';


/**
 * A base connection layouter implementation
 * that layouts the connection by directly connecting
 * mid(source) + mid(target).
 */
export default class BaseLayouter {
	/**
	 * Return the new layouted waypoints for the given connection.
	 *
	 * The connection passed is still unchanged; you may figure out about
	 * the new connection start / end via the layout hints provided.
	 *
	 * @param {djs.model.Connection} connection
	 * @param {Object} [hints]
	 * @param {Point} [hints.connectionStart]
	 * @param {Point} [hints.connectionEnd]
	 *
	 * @return {Array<Point>} the layouted connection waypoints
	 */
	public layoutConnection(connection : Connection, hints : any) {

		hints = hints || {};

		return [
			hints.connectionStart || getMid(connection.source),
			hints.connectionEnd || getMid(connection.target)
		];
	};
}



