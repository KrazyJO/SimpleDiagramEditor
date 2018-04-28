import {
	isArray,
	forEach,
	map,
	matchPattern,
	find,
	findIndex,
	sortBy,
	reduce
} from 'min-dash';

import { getBBox } from '../../util/Elements';

import {
	center,
	delta as posDelta
} from '../../util/PositionUtil';

import {
	getTopLevel
} from '../../util/CopyPasteUtil';

import {
	eachElement
} from '../../util/Elements';
import EventBus from '../../core/EventBus';
import Modeling from '../modeling/Modeling';
import ElementFactory from '../../core/ElementFactory';
import Rules from '../rules/Rules';
import Clipboard from '../clipboard/Clipboard';
import Canvas from '../../core/Canvas';
import { Point } from '../../interfaces';


export default class CopyPaste {


	private _eventBus: EventBus;
	private _modeling: Modeling;
	private _elementFactory: ElementFactory;
	private _rules: Rules;
	private _canvas: Canvas;
	private _clipboard: Clipboard;
	private _descriptors: any;
	private _bbox: any;

	public static $inject = [
		'eventBus',
		'modeling',
		'elementFactory',
		'rules',
		'clipboard',
		'canvas'
	];

	constructor(
		eventBus: EventBus, modeling: Modeling, elementFactory: ElementFactory,
		rules: Rules, clipboard: Clipboard, canvas: Canvas) {
		this._eventBus = eventBus;
		this._modeling = modeling;
		this._elementFactory = elementFactory;
		this._rules = rules;
		this._canvas = canvas;

		this._clipboard = clipboard;

		this._descriptors = [];


		// Element creation priorities:
		// - 1: Independent shapes
		// - 2: Attached shapes
		// - 3: Connections
		// - 4: labels
		this.registerDescriptor(function (element: any, descriptor: any) {
			// Base priority
			descriptor.priority = 1;

			descriptor.id = element.id;

			if (element.parent) {
				descriptor.parent = element.parent.id;
			}

			if (element.labelTarget) {
				// Labels priority
				descriptor.priority = 4;
				descriptor.labelTarget = element.labelTarget.id;
			}

			if (element.host) {
				// Attached shapes priority
				descriptor.priority = 2;
				descriptor.host = element.host.id;
			}

			if (typeof element.x === 'number') {
				descriptor.x = element.x;
				descriptor.y = element.y;
			}

			if (element.width) {
				descriptor.width = element.width;
				descriptor.height = element.height;
			}

			if (element.waypoints) {
				// Connections priority
				descriptor.priority = 3;
				descriptor.waypoints = [];

				forEach(element.waypoints, function (waypoint: Point) {
					var wp: any = {
						x: waypoint.x,
						y: waypoint.y
					};

					if (waypoint.original) {
						wp.original = {
							x: waypoint.original.x,
							y: waypoint.original.y
						};
					}

					descriptor.waypoints.push(wp);
				});
			}

			if (element.source && element.target) {
				descriptor.source = element.source.id;
				descriptor.target = element.target.id;
			}

			return descriptor;
		});
	}

	/**
   * Copy a number of elements.
   *
   * @param {djs.model.Base} selectedElements
   *
   * @return {Object} the copied tree
   */
	public copy(selectedElements: any) {
		var clipboard = this._clipboard,
			tree, bbox: any;

		if (!isArray(selectedElements)) {
			selectedElements = selectedElements ? [selectedElements] : [];
		}

		if (!selectedElements.length) {
			return;
		}

		tree = this.createTree(selectedElements);

		bbox = this._bbox = center(getBBox(tree.allShapes));

		// not needed after computing the center position of the copied elements
		delete tree.allShapes;

		forEach(tree, function (elements: any) {

			forEach(elements, function (element: any) {
				var delta: any, labelTarget;

				// set label's relative position to their label target
				if (element.labelTarget) {
					labelTarget = find(elements, matchPattern({ id: element.labelTarget }));

					// just grab the delta from the first waypoint
					if (labelTarget.waypoints) {
						delta = posDelta(element, labelTarget.waypoints[0]);
					} else {
						delta = posDelta(element, labelTarget);
					}

				} else
					if (element.priority === 3) {
						// connections have priority 3
						delta = [];

						forEach(element.waypoints, function (waypoint: Point) {
							var waypointDelta = posDelta(waypoint, bbox);

							delta.push(waypointDelta);
						});
					} else {
						delta = posDelta(element, bbox);
					}

				element.delta = delta;
			});
		});

		this._eventBus.fire('elements.copy', { context: { tree: tree } });

		// if tree is empty, means that nothing can be or is allowed to be copied
		if (Object.keys(tree).length === 0) {
			clipboard.clear();
		} else {
			clipboard.set(tree);
		}

		this._eventBus.fire('elements.copied', { context: { tree: tree } });

		return tree;
	};


	// Allow pasting under the cursor
	public paste(context: any) {
		var clipboard = this._clipboard,
			modeling = this._modeling,
			eventBus = this._eventBus,
			rules = this._rules;

		var tree = clipboard.get(),
			topParent = context.element,
			position = context.point,
			newTree, canPaste;

		if (clipboard.isEmpty()) {
			return;
		}

		newTree = reduce(tree, function (pasteTree: any, elements: any, depthStr: string) {
			var depth = parseInt(depthStr, 10);

			if (isNaN(depth)) {
				return pasteTree;
			}

			pasteTree[depth] = elements;

			return pasteTree;
		}, {});


		canPaste = rules.allowed('elements.paste', {
			tree: newTree,
			target: topParent
		});

		if (!canPaste) {
			eventBus.fire('elements.paste.rejected', {
				context: {
					tree: newTree,
					position: position,
					target: topParent
				}
			});

			return;
		}

		modeling.pasteElements(newTree, topParent, position);
	};


	public _computeDelta(elements: any, element: any) {
		var bbox = this._bbox,
			delta: any = {};

		// set label's relative position to their label target
		if (element.labelTarget) {
			return posDelta(element, element.labelTarget);
		}

		// connections have prority 3
		if (element.priority === 3) {
			delta = [];

			forEach(element.waypoints, function (waypoint: Point) {
				var waypointDelta = posDelta(waypoint, bbox);

				delta.push(waypointDelta);
			});
		} else {
			delta = posDelta(element, bbox);
		}

		return delta;
	};


	/**
	 * Checks if the element in question has a relations to other elements.
	 * Possible dependants: connections, labels, attachers
	 *
	 * @param  {Array} elements
	 * @param  {Object} element
	 *
	 * @return {Boolean}
	 */
	public hasRelations(elements: any[], element: any): boolean {
		var source, target, labelTarget;

		if (element.waypoints) {
			source = find(elements, matchPattern({ id: element.source.id }));
			target = find(elements, matchPattern({ id: element.target.id }));

			if (!source || !target) {
				return false;
			}
		}

		if (element.labelTarget) {
			labelTarget = find(elements, matchPattern({ id: element.labelTarget.id }));

			if (!labelTarget) {
				return false;
			}
		}

		return true;
	};


	public registerDescriptor(descriptor: any) {
		if (typeof descriptor !== 'function') {
			throw new Error('the descriptor must be a function');
		}

		if (this._descriptors.indexOf(descriptor) !== -1) {
			throw new Error('this descriptor is already registered');
		}

		this._descriptors.push(descriptor);
	};


	private _executeDescriptors(data: any) {
		if (!data.descriptor) {
			data.descriptor = {};
		}

		forEach(this._descriptors, function (descriptor: any) {
			data.descriptor = descriptor(data.element, data.descriptor);
		});

		return data;
	};

	/**
	 * Creates a tree like structure from an arbitrary collection of elements
	 *
	 * @example
	 * tree: {
	 *	0: [
	 *		{ id: 'shape_12da', priority: 1, ... },
	 *		{ id: 'shape_01bj', priority: 1, ... },
	 *		{ id: 'connection_79fa', source: 'shape_12da', target: 'shape_01bj', priority: 3, ... },
	 *	],
	 *	1: [ ... ]
	 * };
	 *
	 * @param  {Array} elements
	 * @return {Object}
	 */
	public createTree(elements: any[]) {
		var rules = this._rules,
			self = this;

		var tree: any = {},
			includedElements: any = [],
			_elements: any;

		var topLevel = getTopLevel(elements);

		tree.allShapes = [];

		function canCopy(collection: any, element: any) {
			return rules.allowed('element.copy', {
				collection: collection,
				element: element
			});
		}

		function includeElement(data: any) {
			var idx = findIndex(includedElements, matchPattern({ element: data.element })),
				element;

			if (idx !== -1) {
				element = includedElements[idx];
			} else {
				return includedElements.push(data);
			}

			// makes sure that it has the correct depth
			if (element.depth < data.depth) {
				includedElements.splice(idx, 1);

				includedElements.push(data);
			}
		}


		eachElement(topLevel, function (element: any, i: number, depth: any) {
			var nestedChildren = element.children;

			// don't add labels directly
			if (element.labelTarget) {
				return;
			}

			function getNested(lists: any) {
				forEach(lists, function (list: any) {
					if (list && list.length) {

						forEach(list, function (elem: any) {
							// fetch element's label
							if (elem.label) {
								includeElement({
									element: elem.label,
									depth: depth
								});
							}

							includeElement({
								element: elem,
								depth: depth
							});
						});
					}
				});
			}

			// fetch element's label
			if (element.label) {
				includeElement({
					element: element.label,
					depth: depth
				});
			}

			getNested([element.attachers, element.incoming, element.outgoing]);

			includeElement({
				element: element,
				depth: depth
			});

			if (nestedChildren) {
				return nestedChildren;
			}
		});

		includedElements = map(includedElements, function (data: any) {
			// this is where other registered descriptors hook in
			return self._executeDescriptors(data);
		});

		// order the elements to check if the ones dependant on others (by relationship)
		// can be copied. f.ex: label needs it's label target
		includedElements = sortBy(includedElements, function (data: any) {
			return data.descriptor.priority;
		});

		_elements = map(includedElements, function (data: any) {
			return data.element;
		});

		forEach(includedElements, function (data: any) {
			var depth = data.depth;

			if (!self.hasRelations(tree.allShapes, data.element)) {
				return;
			}

			if (!canCopy(_elements, data.element)) {
				return;
			}

			tree.allShapes.push(data.element);

			// create depth branches
			if (!tree[depth]) {
				tree[depth] = [];
			}

			tree[depth].push(data.descriptor);
		});

		return tree;
	};
}