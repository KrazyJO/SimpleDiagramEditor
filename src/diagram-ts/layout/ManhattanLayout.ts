import {
	isArray,
	find,
	without,
	assign
} from 'min-dash';

import {
	getOrientation,
	getMid
} from './LayoutUtil';

import {
	pointInRect,
	pointDistance,
	pointsAligned
} from '../util/Geometry';
import { Bounds, Point, hints } from '../../interfaces';

var INTERSECTION_THRESHOLD = 20,
	ORIENTATION_THRESHOLD : any = {
		'h:h': 20,
		'v:v': 20,
		'h:v': -10,
		'v:h': -10
	};


/**
 * Returns the mid points for a manhattan connection between two points.
 *
 * @example
 *
 * [a]----[x]
 *         |
 *        [x]----[b]
 *
 * @example
 *
 * [a]----[x]
 *         |
 *        [b]
 *
 * @param  {Point} a
 * @param  {Point} b
 * @param  {String} directions
 *
 * @return {Array<Point>}
 */
export function getBendpoints(a: Point, b: Point, directions: string): Point[] {

	directions = directions || 'h:h';

	var xmid, ymid;

	// one point, next to a
	if (directions === 'h:v') {
		return [{ x: b.x, y: a.y }];
	} else
		// one point, above a
		if (directions === 'v:h') {
			return [{ x: a.x, y: b.y }];
		} else
			// vertical edge xmid
			if (directions === 'h:h') {
				xmid = Math.round((b.x - a.x) / 2 + a.x);

				return [
					{ x: xmid, y: a.y },
					{ x: xmid, y: b.y }
				];
			} else
				// horizontal edge ymid
				if (directions === 'v:v') {
					ymid = Math.round((b.y - a.y) / 2 + a.y);

					return [
						{ x: a.x, y: ymid },
						{ x: b.x, y: ymid }
					];
				} else {
					throw new Error(
						'unknown directions: <' + directions + '>: ' +
						'directions must be specified as {a direction}:{b direction} (direction in h|v)');
				}
}


/**
 * Create a connection between the two points according
 * to the manhattan layout (only horizontal and vertical) edges.
 *
 * @param {Point} a
 * @param {Point} b
 *
 * @param {String} [directions='h:h'] specifies manhattan directions for each point as {adirection}:{bdirection}.
                   A directionfor a point is either `h` (horizontal) or `v` (vertical)
 *
 * @return {Array<Point>}
 */
export function connectPoints(a: Point, b: Point, directions?: string): Point[] {

	var points: Point[] = [];

	if (!pointsAligned(a, b)) {
		points = getBendpoints(a, b, directions);
	}

	points.unshift(a);
	points.push(b);

	return points;
}


/**
 * Connect two rectangles using a manhattan layouted connection.
 *
 * @param {Bounds} source source rectangle
 * @param {Bounds} target target rectangle
 * @param {Point} [start] source docking
 * @param {Point} [end] target docking
 *
 * @param {Object} [hints]
 * @param {String} [hints.preserveDocking=source] preserve docking on selected side
 * @param {Array<String>} [hints.preferredLayouts]
 * @param {Point|Boolean} [hints.connectionStart] whether the start changed
 * @param {Point|Boolean} [hints.connectionEnd] whether the end changed
 *
 * @return {Array<Point>} connection points
 */
export function connectRectangles(source: Bounds, target: Bounds, start?: Point, end?: Point, hints?: any): Point[] {

	var preferredLayouts = hints && hints.preferredLayouts || [];

	var preferredLayout = without(preferredLayouts, 'straight')[0] || 'h:h';

	var threshold = ORIENTATION_THRESHOLD[preferredLayout] || 0;

	var orientation = getOrientation(source, target, threshold);

	var directions = getDirections(orientation, preferredLayout);

	start = start || getMid(source);
	end = end || getMid(target);

	// overlapping elements
	if (!directions) {
		return undefined;
	}

	if (directions === 'h:h') {

		switch (orientation) {
			case 'top-right':
			case 'right':
			case 'bottom-right':
				start = { original: start, x: source.x, y: start.y };
				end = { original: end, x: target.x + target.width, y: end.y };
				break;
			case 'top-left':
			case 'left':
			case 'bottom-left':
				start = { original: start, x: source.x + source.width, y: start.y };
				end = { original: end, x: target.x, y: end.y };
				break;
		}
	}

	if (directions === 'v:v') {

		switch (orientation) {
			case 'top-left':
			case 'top':
			case 'top-right':
				start = { original: start, x: start.x, y: source.y + source.height };
				end = { original: end, x: end.x, y: target.y };
				break;
			case 'bottom-left':
			case 'bottom':
			case 'bottom-right':
				start = { original: start, x: start.x, y: source.y };
				end = { original: end, x: end.x, y: target.y + target.height };
				break;
		}
	}

	return connectPoints(start, end, directions);
}

/**
 * Repair the connection between two rectangles, of which one has been updated.
 *
 * @param {Bounds} source
 * @param {Bounds} target
 * @param {Point} [start]
 * @param {Point} [end]
 * @param {Array<Point>} waypoints
 * @param {Object} [hints]
 * @param {Array<String>} [hints.preferredLayouts] list of preferred layouts
 * @param {Boolean} [hints.connectionStart]
 * @param {Boolean} [hints.connectionEnd]
 *
 * @return {Array<Point>} repaired waypoints
 */
export function repairConnection(source: Bounds, target: Bounds, start: Point, end: Point, waypoints: Point[] | any, hints: hints | any): Point[] {

	if (isArray(start)) {
		waypoints = start;// =  start;
		hints = end;

		start = getMid(source);
		end = getMid(target);
	}

	hints = assign({ preferredLayouts: [] }, hints);
	waypoints = waypoints || [];

	var preferredLayouts = hints.preferredLayouts,
		preferStraight = preferredLayouts.indexOf('straight') !== -1,
		repairedWaypoints;

	// just layout non-existing or simple connections
	// attempt to render straight lines, if required

	if (preferStraight) {
		// attempt to layout a straight line
		repairedWaypoints = layoutStraight(source, target, start, end, hints);
	}

	if (!repairedWaypoints) {
		// check if we layout from start or end
		if (hints.connectionEnd) {
			repairedWaypoints = _repairConnectionSide(target, source, end, waypoints.slice().reverse());
			repairedWaypoints = repairedWaypoints && repairedWaypoints.reverse();
		} else
			if (hints.connectionStart) {
				repairedWaypoints = _repairConnectionSide(source, target, start, waypoints);
			} else
				// or whether nothing seems to have changed
				if (waypoints && waypoints.length) {
					repairedWaypoints = waypoints;
				}
	}

	// simply reconnect if nothing else worked
	if (!repairedWaypoints) {
		repairedWaypoints = connectRectangles(source, target, start, end, hints);
	}

	return repairedWaypoints;
}


function inRange(a: any, start: any, end: any): boolean {
	return a >= start && a <= end;
}

function isInRange(axis: any, a: any, b: any): boolean {
	var size = {
		x: 'width',
		y: 'height'
	};

	return inRange(a[axis], b[axis], b[axis] + b[size[axis]]);
}

/**
 * Layout a straight connection
 *
 * @param {Bounds} source
 * @param {Bounds} target
 * @param {Point} start
 * @param {Point} end
 * @param {Object} [hints]
 *
 * @return {Array<Point>} waypoints if straight layout worked
 */
export function layoutStraight(source: Bounds, target: Bounds, start: Point, end: Point, hints: hints): Point[] {
	var axis: any = {},
		primaryAxis,
		orientation;

	orientation = getOrientation(source, target);

	// We're only interested in layouting a straight connection
	// if the shapes are horizontally or vertically aligned
	if (!/^(top|bottom|left|right)$/.test(orientation)) {
		return null;
	}

	if (/top|bottom/.test(orientation)) {
		primaryAxis = 'x';
	}

	if (/left|right/.test(orientation)) {
		primaryAxis = 'y';
	}

	if (hints.preserveDocking === 'target') {

		if (!isInRange(primaryAxis, end, source)) {
			return null;
		}

		axis[primaryAxis] = end[primaryAxis];

		return [
			{
				x: axis.x !== undefined ? axis.x : start.x,
				y: axis.y !== undefined ? axis.y : start.y,
				original: {
					x: axis.x !== undefined ? axis.x : start.x,
					y: axis.y !== undefined ? axis.y : start.y
				}
			},
			{
				x: end.x,
				y: end.y
			}
		];

	} else {

		if (!isInRange(primaryAxis, start, target)) {
			return null;
		}

		axis[primaryAxis] = start[primaryAxis];

		return [
			{
				x: start.x,
				y: start.y
			},
			{
				x: axis.x !== undefined ? axis.x : end.x,
				y: axis.y !== undefined ? axis.y : end.y,
				original: {
					x: axis.x !== undefined ? axis.x : end.x,
					y: axis.y !== undefined ? axis.y : end.y
				}
			}
		];
	}

}


/**
 * Repair a connection from one side that moved.
 *
 * @param {Bounds} moved
 * @param {Bounds} other
 * @param {Point} newDocking
 * @param {Array<Point>} points originalPoints from moved to other
 *
 * @return {Array<Point>} the repaired points between the two rectangles
 */
export function _repairConnectionSide(moved: Bounds, other: Bounds, newDocking: Point, points: Point[]): Point[] {

	function needsRelayout(moved: Bounds, other: Bounds, points: Point[]): boolean {

		if (points.length < 3) {
			return true;
		}

		if (points.length > 4) {
			return false;
		}

		// relayout if two points overlap
		// this is most likely due to
		return !!find(points, function (p: Point, idx: number) {
			var q = points[idx - 1];

			return q && pointDistance(p, q) < 3;
		});
	}

	function repairBendpoint(candidate: any, oldPeer: any, newPeer: any) {

		var alignment = pointsAligned(oldPeer, candidate);

		switch (alignment) {
			case 'v':
				// repair vertical alignment
				return { x: candidate.x, y: newPeer.y };
			case 'h':
				// repair horizontal alignment
				return { x: newPeer.x, y: candidate.y };
		}

		return { x: candidate.x, y: candidate.y };
	}

	function removeOverlapping(points: Point[], a: any, b: any) {
		var i;

		for (i = points.length - 2; i !== 0; i--) {

			// intersects (?) break, remove all bendpoints up to this one and relayout
			if (pointInRect(points[i], a, INTERSECTION_THRESHOLD) ||
				pointInRect(points[i], b, INTERSECTION_THRESHOLD)) {

				// return sliced old connection
				return points.slice(i);
			}
		}

		return points;
	}


	// (0) only repair what has layoutable bendpoints

	// (1) if only one bendpoint and on shape moved onto other shapes axis
	//     (horizontally / vertically), relayout

	if (needsRelayout(moved, other, points)) {
		return null;
	}

	var oldDocking = points[0],
		newPoints = points.slice(),
		slicedPoints;

	// (2) repair only last line segment and only if it was layouted before

	newPoints[0] = newDocking;
	newPoints[1] = repairBendpoint(newPoints[1], oldDocking, newDocking);


	// (3) if shape intersects with any bendpoint after repair,
	//     remove all segments up to this bendpoint and repair from there

	slicedPoints = removeOverlapping(newPoints, moved, other);

	if (slicedPoints !== newPoints) {
		return _repairConnectionSide(moved, other, newDocking, slicedPoints);
	}

	return newPoints;
}


/**
 * Returns the manhattan directions connecting two rectangles
 * with the given orientation.
 *
 * @example
 *
 * getDirections('top'); // -> 'v:v'
 *
 * getDirections('top-right', 'v:h'); // -> 'v:h'
 * getDirections('top-right', 'h:h'); // -> 'h:h'
 *
 *
 * @param {String} orientation
 * @param {String} defaultLayout
 *
 * @return {String}
 */
function getDirections(orientation: string, defaultLayout: string): string {

	switch (orientation) {
		case 'intersect':
			return null;

		case 'top':
		case 'bottom':
			return 'v:v';

		case 'left':
		case 'right':
			return 'h:h';

		// 'top-left'
		// 'top-right'
		// 'bottom-left'
		// 'bottom-right'
		default:
			return defaultLayout;
	}
}
