import {
	forEach,
	sortBy
} from 'min-dash';
import Modeling from '../Modeling';


/**
 * A handler that distributes elements evenly.
 */
export default class DistributeElements {

	private _modeling: Modeling;

	public static $inject = ['modeling'];

	constructor(modeling: Modeling) {
		this._modeling = modeling;
	}

	public preExecute(context : any) {
		var modeling = this._modeling;

		var groups = context.groups,
			axis = context.axis,
			dimension = context.dimension;

		function updateRange(group : any, element : any) : void {
			group.range.min = Math.min(element[axis], group.range.min);
			group.range.max = Math.max(element[axis] + element[dimension], group.range.max);
		}

		function center(element : any) : number {
			return element[axis] + element[dimension] / 2;
		}

		function lastIdx(arr : any) : number {
			return arr.length - 1;
		}

		function rangeDiff(range : any) : number {
			return range.max - range.min;
		}

		function centerElement(refCenter : any, element : any) {
			var delta : any = { y: 0 };

			delta[axis] = refCenter - center(element);

			if (delta[axis]) {

				delta[OFF_AXIS[axis]] = 0;

				modeling.moveElements([element], delta, element.parent);
			}
		}

		var firstGroup = groups[0],
			lastGroupIdx = lastIdx(groups),
			lastGroup = groups[lastGroupIdx];

		var margin : any,
			spaceInBetween,
			groupsSize = 0; // the size of each range

		forEach(groups, function (group : any, idx : number) {
			var sortedElements,
				refElem,
				refCenter : any;

			if (group.elements.length < 2) {
				if (idx && idx !== groups.length - 1) {
					updateRange(group, group.elements[0]);

					groupsSize += rangeDiff(group.range);
				}
				return;
			}

			sortedElements = sortBy(group.elements, axis);

			refElem = sortedElements[0];

			if (idx === lastGroupIdx) {
				refElem = sortedElements[lastIdx(sortedElements)];
			}

			refCenter = center(refElem);

			// wanna update the ranges after the shapes have been centered
			group.range = null;

			forEach(sortedElements, function (element : any) {

				centerElement(refCenter, element);

				if (group.range === null) {
					group.range = {
						min: element[axis],
						max: element[axis] + element[dimension]
					};

					return;
				}

				// update group's range after centering the range elements
				updateRange(group, element);
			});

			if (idx && idx !== groups.length - 1) {
				groupsSize += rangeDiff(group.range);
			}
		});

		spaceInBetween = Math.abs(lastGroup.range.min - firstGroup.range.max);

		margin = Math.round((spaceInBetween - groupsSize) / (groups.length - 1));

		if (margin < groups.length - 1) {
			return;
		}

		forEach(groups, function (group : any, groupIdx : number) {
			var delta : any = {},
				prevGroup : any;

			if (group === firstGroup || group === lastGroup) {
				return;
			}

			prevGroup = groups[groupIdx - 1];

			group.range.max = 0;

			forEach(group.elements, function (element : any, idx : number) {
				delta[OFF_AXIS[axis]] = 0;
				delta[axis] = (prevGroup.range.max - element[axis]) + margin;

				if (group.range.min !== element[axis]) {
					delta[axis] += element[axis] - group.range.min;
				}

				if (delta[axis]) {
					modeling.moveElements([element], delta, element.parent);
				}

				group.range.max = Math.max(element[axis] + element[dimension], idx ? group.range.max : 0);
			});
		});
	};

	public postExecute (context : any) {

	};

}


var OFF_AXIS = {
	x: 'y',
	y: 'x'
};