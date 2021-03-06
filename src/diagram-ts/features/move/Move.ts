import {
	assign,
	filter,
	groupBy
} from 'min-dash';

var LOW_PRIORITY = 500,
	MEDIUM_PRIORITY = 1250,
	HIGH_PRIORITY = 1500;

import { getOriginal as getOriginalEvent } from '../../util/Event';
import { Point } from '../../../interfaces';
import EventBus from '../../core/EventBus';
import Modeling from '../modeling/Modeling';
import Rules from '../rules/Rules';
import Selection from '../selection/Selection';
import Dragging from '../dragging/Dragging';

var round = Math.round;

function mid(element: any): Point {
	return {
		x: element.x + round(element.width / 2),
		y: element.y + round(element.height / 2)
	};
}

/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {Modeling} modeling
 * @param {Selection} selection
 * @param {Rules} rules
 */
export default class MoveEvents {

	public start: any;
	public static $inject = [
		'eventBus',
		'dragging',
		'modeling',
		'selection',
		'rules'
	];

	constructor(
		eventBus: EventBus, dragging: Dragging, modeling: Modeling,
		selection: Selection, rules: Rules) {
		// rules

		function canMove(shapes: any, delta?: any, position?: any, target?: any) {

			return rules.allowed('elements.move', {
				shapes: shapes,
				delta: delta,
				position: position,
				target: target
			});
		}


		// move events

		// assign a high priority to this handler to setup the environment
		// others may hook up later, e.g. at default priority and modify
		// the move environment.
		//
		// This sets up the context with
		//
		// * shape: the primary shape being moved
		// * shapes: a list of shapes to be moved
		// * validatedShapes: a list of shapes that are being checked
		//                    against the rules before and during move
		//
		eventBus.on('shape.move.start', HIGH_PRIORITY, function (event: any) {

			var context = event.context,
				shape = event.shape,
				shapes = selection.get().slice();

			// move only single shape if the dragged element
			// is not part of the current selection
			if (shapes.indexOf(shape) === -1) {
				shapes = [shape];
			}

			// ensure we remove nested elements in the collection
			// and add attachers for a proper dragger
			shapes = removeNested(shapes);

			// attach shapes to drag context
			assign(context, {
				shapes: shapes,
				validatedShapes: shapes,
				shape: shape
			});
		});


		// assign a high priority to this handler to setup the environment
		// others may hook up later, e.g. at default priority and modify
		// the move environment
		//
		eventBus.on('shape.move.start', MEDIUM_PRIORITY, function (event: any): boolean | void {

			var context = event.context,
				validatedShapes = context.validatedShapes,
				canExecute;

			canExecute = context.canExecute = canMove(validatedShapes);

			// check if we can move the elements
			if (!canExecute) {
				return false;
			}
		});

		// assign a low priority to this handler
		// to let others modify the move event before we update
		// the context
		//
		eventBus.on('shape.move.move', LOW_PRIORITY, function (event: any) {

			var context = event.context,
				validatedShapes = context.validatedShapes,
				hover = event.hover,
				delta = { x: event.dx, y: event.dy },
				position = { x: event.x, y: event.y },
				canExecute;

			// check if we can move the elements
			canExecute = canMove(validatedShapes, delta, position, hover);

			context.delta = delta;
			context.canExecute = canExecute;

			// simply ignore move over
			if (canExecute === null) {
				context.target = null;

				return;
			}

			context.target = hover;
		});

		eventBus.on('shape.move.end', function (event: any): boolean | void {

			var context = event.context;

			var delta = context.delta,
				canExecute = context.canExecute,
				isAttach = canExecute === 'attach',
				shapes = context.shapes;

			if (!canExecute) {
				return false;
			}

			// ensure we have actual pixel values deltas
			// (important when zoom level was > 1 during move)
			delta.x = round(delta.x);
			delta.y = round(delta.y);

			modeling.moveElements(shapes, delta, context.target, {
				primaryShape: context.shape,
				attach: isAttach
			});
		});


		// move activation

		eventBus.on('element.mousedown', function (event: any) {

			var originalEvent = getOriginalEvent(event);

			if (!originalEvent) {
				throw new Error('must supply DOM mousedown event');
			}

			return start(originalEvent, event.element);
		});


		function start(event: any, element: any, activate?: any): boolean | void {

			// do not move connections or the root element
			if (element.waypoints || !element.parent) {
				return;
			}

			var referencePoint = mid(element);

			dragging.init(event, referencePoint, 'shape.move', {
				cursor: 'grabbing',
				autoActivate: activate,
				data: {
					shape: element,
					context: {}
				}
			});

			// we've handled the event
			return true;
		}

		// API


		this.start = start;

	}

}



/**
 * Return a filtered list of elements that do not contain
 * those nested into others.
 *
 * @param  {Array<djs.model.Base>} elements
 *
 * @return {Array<djs.model.Base>} filtered
 */
function removeNested(elements: any) {

	var ids = groupBy(elements, 'id');

	return filter(elements, function (element: any) {
		while ((element = element.parent)) {

			// parent in selection
			if (ids[element.id]) {
				return false;
			}
		}

		return true;
	});
}
