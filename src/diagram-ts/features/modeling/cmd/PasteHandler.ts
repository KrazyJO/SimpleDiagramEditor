import {
	forEach,
	map,
	sortBy,
	assign,
} from 'min-dash';
import EventBus from '../../../core/EventBus';
import Canvas from '../../../core/Canvas';
import ElementFactory from '../../../core/ElementFactory';
import Modeling from '../Modeling';
import Rules from '../../rules/Rules';
import { Point } from '../../../interfaces';
import Selection from '../../selection/Selection';

function removeProperties(element: any, properties: any) {
	forEach(properties, function (prop: any) {
		if (element[prop]) {
			delete element[prop];
		}
	});
}

/**
 * A handler that implements pasting of elements onto the diagram.
 *
 * @param {eventBus} EventBus
 * @param {canvas} Canvas
 * @param {selection} Selection
 * @param {elementFactory} ElementFactory
 * @param {modeling} Modeling
 * @param {rules} Rules
 */
export default class PasteHandler {

	private _eventBus: EventBus;
	public _canvas: Canvas;
	private _selection: Selection;
	private _modeling: Modeling;
	private _elementFactory: ElementFactory;
	private _rules: Rules;

	public static $inject = [
		'eventBus',
		'canvas',
		'selection',
		'elementFactory',
		'modeling',
		'rules'
	];

	constructor(eventBus: EventBus, canvas: Canvas, selection: Selection,
		elementFactory: ElementFactory, modeling: Modeling, rules: Rules) {

		this._eventBus = eventBus;
		this._canvas = canvas;
		this._selection = selection;
		this._elementFactory = elementFactory;
		this._modeling = modeling;
		this._rules = rules;
	}

	// api //////////////////////

	/**
	 * Creates a new shape
	 *
	 * @param {Object} context
	 * @param {Object} context.tree the new shape
	 * @param {Element} context.topParent the paste target
	 */
	public preExecute(context : any) : void{
		var eventBus = this._eventBus,
			self = this;

		var tree = context.tree,
			topParent = context.topParent,
			position = context.position;

		tree.createdElements = {};

		tree.labels = [];

		forEach(tree, function (elements : any, depthStr : string) {
			var depth = parseInt(depthStr, 10);

			if (isNaN(depth)) {
				return;
			}

			// set the parent on the top level elements
			if (!depth) {
				elements = map(elements, function (descriptor : any) {
					descriptor.parent = topParent;

					return descriptor;
				});
			}

			// Order by priority for element creation
			elements = sortBy(elements, 'priority');

			forEach(elements, function (descriptor : any) {
				var id = descriptor.id,
					parent = descriptor.parent,
					hints : any = {},
					newPosition;

				var element = assign({}, descriptor);

				if (depth) {
					element.parent = self._getCreatedElement(parent, tree);
				}

				// this happens when shapes have not been created due to rules
				if (!parent) {
					return;
				}

				eventBus.fire('element.paste', {
					createdElements: tree.createdElements,
					descriptor: element
				});

				// in case the parent changed during 'element.paste'
				parent = element.parent;

				if (element.waypoints) {
					element = self._createConnection(element, parent, position, tree);

					if (element) {
						tree.createdElements[id] = {
							element: element,
							descriptor: descriptor
						};
					}

					return;
				}


				// supply not-root information as hint
				if (element.parent !== topParent) {
					hints.root = false;
				}

				// set host
				if (element.host) {
					hints.attach = true;

					parent = self._getCreatedElement(element.host, tree);
				}

				// handle labels
				if (element.labelTarget) {
					return tree.labels.push(element);
				}

				newPosition = {
					x: Math.round(position.x + element.delta.x + (element.width / 2)),
					y: Math.round(position.y + element.delta.y + (element.height / 2))
				};

				removeProperties(element, [
					'id',
					'parent',
					'delta',
					'host',
					'priority'
				]);

				element = self._createShape(element, parent, newPosition, hints);

				if (element) {
					tree.createdElements[id] = {
						element: element,
						descriptor: descriptor
					};
				}
			});
		});
	};

	// move label's to their relative position
	public postExecute(context : any) {
		var modeling = this._modeling,
			selection = this._selection,
			self = this;

		var tree = context.tree,
			labels = tree.labels,
			topLevelElements : any[]= [];

		forEach(labels, function (labelDescriptor : any) {
			var labelTarget = self._getCreatedElement(labelDescriptor.labelTarget, tree),
				label, labelTargetPos, newPosition;

			if (!labelTarget) {
				return;
			}

			label = labelTarget.label;

			if (!label) {
				return;
			}

			labelTargetPos = {
				x: labelTarget.x,
				y: labelTarget.y
			};

			if (labelTarget.waypoints) {
				labelTargetPos = labelTarget.waypoints[0];
			}

			newPosition = {
				x: Math.round((labelTargetPos.x - label.x) + labelDescriptor.delta.x),
				y: Math.round((labelTargetPos.y - label.y) + labelDescriptor.delta.y)
			};

			modeling.moveShape(label, newPosition, labelTarget.parent);
		});

		forEach(tree[0], function (descriptor : any) {
			var id = descriptor.id,
				toplevel = tree.createdElements[id];

			if (toplevel) {
				topLevelElements.push(toplevel.element);
			}
		});

		selection.select(topLevelElements);
	};


	private _createConnection(element : any, parent : any, parentCenter : any, tree : any) {
		var modeling = this._modeling,
			rules = this._rules;

		var connection, source, target, canPaste;

		element.waypoints = map(element.waypoints, function (waypoint : Point, idx : number) {
			return {
				x: Math.round(parentCenter.x + element.delta[idx].x),
				y: Math.round(parentCenter.y + element.delta[idx].y)
			};
		});

		source = this._getCreatedElement(element.source, tree);
		target = this._getCreatedElement(element.target, tree);

		if (!source || !target) {
			return null;
		}

		canPaste = rules.allowed('element.paste', {
			source: source,
			target: target
		});

		if (!canPaste) {
			return null;
		}

		removeProperties(element, [
			'id',
			'parent',
			'delta',
			'source',
			'target',
			'width',
			'height',
			'priority'
		]);

		connection = modeling.createConnection(source, target, element, parent);

		return connection;
	};


	private _createShape(element : any, parent : any, position : any, isAttach : any, hints? : any) {
		var modeling = this._modeling,
			elementFactory = this._elementFactory,
			rules = this._rules;

		var canPaste = rules.allowed('element.paste', {
			element: element,
			position: position,
			parent: parent
		});

		if (!canPaste) {
			return null;
		}

		var shape = elementFactory.createShape(element);

		modeling.createShape(shape, position, parent, isAttach, hints);

		return shape;
	};


	private _getCreatedElement(id : number, tree : any) {
		return tree.createdElements[id] && tree.createdElements[id].element;
	};
}




