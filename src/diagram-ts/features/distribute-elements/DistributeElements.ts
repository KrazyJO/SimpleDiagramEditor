import {
	sortBy,
	forEach,
	filter
} from 'min-dash';
import Modeling from '../modeling/Modeling';

var AXIS_DIMENSIONS = {
	horizontal: ['x', 'width'],
	vertical: ['y', 'height']
};

var THRESHOLD = 5;


/**
 * Groups and filters elements and then trigger even distribution.
 */
export default class DistributeElements {

	private _modeling: Modeling;
	private _filters: any;
	private _axis: any;
	private _dimension: any;

	public static $inject = ['modeling'];

	constructor(modeling: Modeling) {
		this._modeling = modeling;

		this._filters = [];

		// register filter for filtering big elements
		this.registerFilter(function (elements: any, axis: any, dimension: any) {
			var elementsSize = 0,
				numOfShapes = 0,
				avgDimension: any;

			forEach(elements, function (element: any) {
				if (element.waypoints || element.labelTarget) {
					return;
				}

				elementsSize += element[dimension];

				numOfShapes += 1;
			});

			avgDimension = Math.round(elementsSize / numOfShapes);

			return filter(elements, function (element: any) {
				return element[dimension] < (avgDimension + 50);
			});
		});
	}

	/**
   * Registers filter functions that allow external parties to filter
   * out certain elements.
   *
   * @param  {Function} filterFn
   */
	public registerFilter(filterFn: Function) {
		if (typeof filterFn !== 'function') {
			throw new Error('the filter has to be a function');
		}

		this._filters.push(filterFn);
	};

	/**
	 * Distributes the elements with a given orientation
	 *
	 * @param  {Array} elements    [description]
	 * @param  {String} orientation [description]
	 */
	public trigger(elements: any[], orientation: string): any {
		var modeling = this._modeling;

		var groups,
			distributableElements;

		if (elements.length < 3) {
			return;
		}

		this._setOrientation(orientation);

		distributableElements = this._filterElements(elements);

		groups = this._createGroups(distributableElements);

		// nothing to distribute
		if (groups.length <= 2) {
			return;
		}

		modeling.distributeElements(groups, this._axis, this._dimension);

		return groups;
	};

	/**
	 * Filters the elements with provided filters by external parties
	 *
	 * @param  {Array[Elements]} elements
	 *
	 * @return {Array[Elements]}
	 */
	private _filterElements(elements: any) {
		var filters = this._filters,
			axis = this._axis,
			dimension = this._dimension,
			distributableElements = [].concat(elements);

		if (!filters.length) {
			return elements;
		}

		forEach(filters, function (filterFn: Function) {
			distributableElements = filterFn(distributableElements, axis, dimension);
		});

		return distributableElements;
	};


	/**
	 * Create range (min, max) groups. Also tries to group elements
	 * together that share the same range.
	 *
	 * @example
	 * 	var distributableElements = [
	 * 		{
	 * 			range: {
	 * 				min: 100,
	 * 				max: 200
	 * 			},
	 * 			elements: [ { id: 'shape1', .. }]
	 * 		}
	 * 	]
	 *
	 * @param  {Array} elements
	 *
	 * @return {Array[Objects]}
	 */
	private _createGroups(elements: any) {
		var rangeGroups: any = [],
			self = this,
			axis = this._axis,
			dimension = this._dimension;

		if (!axis) {
			throw new Error('must have a defined "axis" and "dimension"');
		}

		// sort by 'left->right' or 'top->bottom'
		var sortedElements = sortBy(elements, axis);

		forEach(sortedElements, function (element: any, idx: number) {
			var elementRange = self._findRange(element, axis, dimension),
				range;

			var previous = rangeGroups[rangeGroups.length - 1];

			if (previous && self._hasIntersection(previous.range, elementRange)) {
				rangeGroups[rangeGroups.length - 1].elements.push(element);
			} else {
				range = { range: elementRange, elements: [element] };

				rangeGroups.push(range);
			}
		});

		return rangeGroups;
	};


	/**
	 * Maps a direction to the according axis and dimension
	 *
	 * @param  {String} direction 'horizontal' or 'vertical'
	 */
	private _setOrientation(direction: string) {
		var orientation = AXIS_DIMENSIONS[direction];

		this._axis = orientation[0];
		this._dimension = orientation[1];
	};


	/**
	 * Checks if the two ranges intercept each other
	 *
	 * @param  {Object} rangeA {min, max}
	 * @param  {Object} rangeB {min, max}
	 *
	 * @return {Boolean}
	 */
	private _hasIntersection(rangeA: any, rangeB: any): boolean {
		return Math.max(rangeA.min, rangeA.max) >= Math.min(rangeB.min, rangeB.max) &&
			Math.min(rangeA.min, rangeA.max) <= Math.max(rangeB.min, rangeB.max);
	};


	/**
	 * Returns the min and max values for an element
	 *
	 * @param  {[type]} element   [description]
	 * @param  {[type]} axis      [description]
	 * @param  {[type]} dimension [description]
	 *
	 * @return {[type]}           [description]
	 */
	private _findRange(element: any, axis: any, dimension: any) {
		var axis = element[this._axis],
			dimension = element[this._dimension];

		return {
			min: axis + THRESHOLD,
			max: axis + dimension - THRESHOLD
		};
	};



}