import {
  filter,
  forEach,
  sortBy
} from 'min-dash';
import Modeling from '../modeling/Modeling';

function last(arr: any[]): any {
  return arr && arr[arr.length - 1];
}

function sortTopOrMiddle(element: any): any {
  return element.y;
}

function sortLeftOrCenter(element: any): any {
  return element.x;
}

/**
 * Sorting functions for different types of alignment
 *
 * @type {Object}
 *
 * @return {Function}
 */
var ALIGNMENT_SORTING = {
  left: sortLeftOrCenter,
  center: sortLeftOrCenter,
  right: function (element: any): any {
    return element.x + element.width;
  },
  top: sortTopOrMiddle,
  middle: sortTopOrMiddle,
  bottom: function (element: any): any {
    return element.y + element.height;
  }
};


export default class AlignElements {

  private _modeling: Modeling;

  public static $inject = ['modeling'];

  constructor(modeling: Modeling) {
    this._modeling = modeling;
  }


  /**
   * Get the relevant "axis" and "dimension" related to the current type of alignment
   *
   * @param  {String} type left|right|center|top|bottom|middle
   *
   * @return {Object} { axis, dimension }
   */
  private _getOrientationDetails(type: string) {
    var vertical = ['top', 'bottom', 'middle'],
      axis = 'x',
      dimension = 'width';

    if (vertical.indexOf(type) !== -1) {
      axis = 'y';
      dimension = 'height';
    }

    return {
      axis: axis,
      dimension: dimension
    };
  };

  private _isType(type: any, types: any) {
    return types.indexOf(type) !== -1;
  };

  /**
   * Get a point on the relevant axis where elements should align to
   *
   * @param  {String} type left|right|center|top|bottom|middle
   * @param  {Array} sortedElements
   *
   * @return {Object}
   */
  private _alignmentPosition(type: string, sortedElements: any[]): any {
    var orientation = this._getOrientationDetails(type),
      axis = orientation.axis,
      dimension = orientation.dimension,
      alignment = {},
      centers = {},
      hasSharedCenters = false,
      centeredElements,
      firstElement,
      lastElement;

    function getMiddleOrTop(first: any, last: any): number {
      return Math.round((first[axis] + last[axis] + last[dimension]) / 2);
    }

    if (this._isType(type, ['left', 'top'])) {
      alignment[type] = sortedElements[0][axis];

    } else if (this._isType(type, ['right', 'bottom'])) {
      lastElement = last(sortedElements);

      alignment[type] = lastElement[axis] + lastElement[dimension];

    } else if (this._isType(type, ['center', 'middle'])) {

      // check if there is a center shared by more than one shape
      // if not, just take the middle of the range
      forEach(sortedElements, function (element: any) {
        var center = element[axis] + Math.round(element[dimension] / 2);

        if (centers[center]) {
          centers[center].elements.push(element);
        } else {
          centers[center] = {
            elements: [element],
            center: center
          };
        }
      });

      centeredElements = sortBy(centers, function (center: any) {
        if (center.elements.length > 1) {
          hasSharedCenters = true;
        }

        return center.elements.length;
      });

      if (hasSharedCenters) {
        alignment[type] = last(centeredElements).center;

        return alignment;
      }

      firstElement = sortedElements[0];

      sortedElements = sortBy(sortedElements, function (element: any) {
        return element[axis] + element[dimension];
      });

      lastElement = last(sortedElements);

      alignment[type] = getMiddleOrTop(firstElement, lastElement);
    }

    return alignment;
  };

  /**
   * Executes the alignment of a selection of elements
   *
   * @param  {Array} elements [description]
   * @param  {String} type left|right|center|top|bottom|middle
   */
  public trigger(elements: any[], type: string): void {
    var modeling = this._modeling;

    var filteredElements = filter(elements, function (element: any) {
      return !(element.waypoints || element.host || element.labelTarget);
    });

    var sortFn = ALIGNMENT_SORTING[type];

    var sortedElements = sortBy(filteredElements, sortFn);

    var alignment = this._alignmentPosition(type, sortedElements);

    modeling.alignElements(sortedElements, alignment);
  };
}
