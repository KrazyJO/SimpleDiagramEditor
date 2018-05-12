import {
	set as cursorSet,
	unset as cursorUnset
} from '../../util/Cursor';

import {
	install as installClickTrap
} from '../../util/ClickTrap';

import {
	substract
} from '../../util/Math';

// import {
// 	event as domEvent,
// 	closest as domClosest
// } from 'min-dom';

const {
	event,
	closest
} = require('min-dom');

import {
	toPoint
} from '../../util/Event';
import EventBus from '../../core/EventBus';
import Canvas from '../../core/Canvas';
import { Point } from '../../../interfaces';


function length(point: Point): number {
	return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}

var THRESHOLD = 15;


export default class MoveCanvas {

	static $inject = ['eventBus', 'canvas'];

	constructor(eventBus: EventBus, canvas: Canvas) {
		var context: any;

	function handleMove(event: any) {

		var start = context.start,
			position = toPoint(event),
			delta = substract(position, start);

		if (!context.dragging && length(delta) > THRESHOLD) {
			context.dragging = true;

			installClickTrap(eventBus);

			cursorSet('grab');
		}

		if (context.dragging) {

			var lastPosition = context.last || context.start;

			delta = substract(position, lastPosition);

			canvas.scroll({
				dx: delta.x,
				dy: delta.y
			});

			context.last = position;
		}

		// prevent select
		event.preventDefault();
	}


	function handleEnd(/*event*/) {
		event.unbind(document, 'mousemove', handleMove);
		event.unbind(document, 'mouseup', handleEnd);

		context = null;

		cursorUnset();
	}

	function handleStart(event: any): boolean | void {
		// event is already handled by '.djs-draggable'
		if (closest(event.target, '.djs-draggable')) {
			return;
		}


		// reject non-left left mouse button or modifier key
		if (event.button || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		context = {
			start: toPoint(event)
		};

		event.bind(document, 'mousemove', handleMove);
		event.bind(document, 'mouseup', handleEnd);

		// we've handled the event
		return true;
	}

	// listen for move on element mouse down;
	// allow others to hook into the event before us though
	// (dragging / element moving will do this)
	eventBus.on('element.mousedown', 500, function (e: any): any {
		return handleStart(e.originalEvent);
	});
	}
	

}


// MoveCanvas.$inject = ['eventBus', 'canvas'];
