import { Shape, Connection } from "../model";

/**
 * @memberOf djs.layout
 */

/**
 * @class DockingPointDescriptor
 */

/**
 * @name DockingPointDescriptor#point
 * @type djs.Point
 */

/**
 * @name DockingPointDescriptor#actual
 * @type djs.Point
 */

/**
 * @name DockingPointDescriptor#idx
 * @type Number
 */

/**
 * A layout component for connections that retrieves waypoint information.
 *
 * @class
 * @constructor
 */
export default class ConnectionDocking {
	/**
   * Return the actual waypoints of the connection (visually).
   *
   * @param {djs.model.Connection} connection
   * @param {djs.model.Base} [source]
   * @param {djs.model.Base} [target]
   * 
   * @return {Array<Point>}
   */
	public getCroppedWaypoints(connection: any, source: any, target: any): any {
		return connection.waypoints;
		//test
	};

	/**
	 * Return the connection docking point on the specified shape
	 *
	 * @param {djs.model.Connection} connection
	 * @param {djs.model.Shape} shape
	 * @param {Boolean} [dockStart=false]
	 *
	 * @return {DockingPointDescriptor}
	 */
	public getDockingPoint(connection: any, shape: Shape, dockStart: any): any {

		var waypoints = connection.waypoints,
			dockingIdx,
			dockingPoint;

		dockingIdx = dockStart ? 0 : waypoints.length - 1;
		dockingPoint = waypoints[dockingIdx];

		return {
			point: dockingPoint,
			actual: dockingPoint,
			idx: dockingIdx
		};
	};
}
