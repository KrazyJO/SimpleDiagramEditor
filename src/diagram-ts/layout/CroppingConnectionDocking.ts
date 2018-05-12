import {
	assign
} from 'min-dash';

import {
	getElementLineIntersection
} from './LayoutUtil';
import ElementRegistry from '../core/ElementRegistry';
import GraphicsFactory from '../core/GraphicsFactory';


function dockingToPoint(docking : any) {
	// use the dockings actual point and
	// retain the original docking
	return assign({ original: docking.point.original || docking.point }, docking.actual);
}

export interface dockingPoint {
	point: any,
	actual: any,
	idx: number
};

/**
 * A {@link ConnectionDocking} that crops connection waypoints based on
 * the path(s) of the connection source and target.
 *
 * @param {djs.core.ElementRegistry} elementRegistry
 */
export default class CroppingConnectionDocking {

	static $inject = ['elementRegistry', 'graphicsFactory'];

	_elementRegistry: ElementRegistry;
	private _graphicsFactory: GraphicsFactory;

	constructor(elementRegistry: ElementRegistry, graphicsFactory: GraphicsFactory) {

		this._elementRegistry = elementRegistry;
		this._graphicsFactory = graphicsFactory;
	}

	/**
   * @inheritDoc ConnectionDocking#getCroppedWaypoints
   */
	public getCroppedWaypoints(connection : any, source : any, target : any) : any {

		source = source || connection.source;
		target = target || connection.target;

		var sourceDocking = this.getDockingPoint(connection, source, true),
			targetDocking = this.getDockingPoint(connection, target);

		var croppedWaypoints = connection.waypoints.slice(sourceDocking.idx + 1, targetDocking.idx);

		croppedWaypoints.unshift(dockingToPoint(sourceDocking));
		croppedWaypoints.push(dockingToPoint(targetDocking));

		return croppedWaypoints;
	};

	/**
	 * Return the connection docking point on the specified shape
	 *
	 * @inheritDoc ConnectionDocking#getDockingPoint
	 */
	public getDockingPoint(connection : any, shape : any, dockStart? : any) : dockingPoint {

		var waypoints = connection.waypoints,
			dockingIdx,
			dockingPoint,
			croppedPoint;

		dockingIdx = dockStart ? 0 : waypoints.length - 1;
		dockingPoint = waypoints[dockingIdx];

		croppedPoint = this._getIntersection(shape, connection, dockStart);

		return {
			point: dockingPoint,
			actual: croppedPoint || dockingPoint,
			idx: dockingIdx
		};
	};


	// helpers //////////////////////

	private _getIntersection(shape : any, connection : any, takeFirst : any) : any {

		var shapePath = this._getShapePath(shape),
			connectionPath = this._getConnectionPath(connection);

		return getElementLineIntersection(shapePath, connectionPath, takeFirst);
	};

	private _getConnectionPath(connection : any) {
		return this._graphicsFactory.getConnectionPath(connection);
	};

	private _getShapePath(shape : any) {
		return this._graphicsFactory.getShapePath(shape);
	};

	// private _getGfx(element : any) {
	// 	return this._elementRegistry.getGraphics(element);
	// };


}