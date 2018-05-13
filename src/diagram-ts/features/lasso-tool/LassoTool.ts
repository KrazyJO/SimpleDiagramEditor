import { values } from 'min-dash';

import { getEnclosedElements } from '../../util/Elements';

import { hasSecondaryModifier } from '../../util/Mouse';

import {
	append as svgAppend,
	attr as svgAttr,
	create as svgCreate,
	remove as svgRemove
} from 'tiny-svg';
import EventBus from '../../core/EventBus';
import Canvas from '../../core/Canvas';
import Dragging from '../dragging/Dragging';
import ElementRegistry from '../../core/ElementRegistry';
import ToolManager from '../tool-manager/ToolManager';

var LASSO_TOOL_CURSOR = 'crosshair';


export default class LassoTool {

	public static $inject = [
		'eventBus',
		'canvas',
		'dragging',
		'elementRegistry',
		'selection',
		'toolManager'
	];

	private _selection: any;
	private _dragging: Dragging;
	constructor(eventBus: EventBus, canvas: Canvas, dragging: Dragging,
		elementRegistry: ElementRegistry, selection: Selection, toolManager: ToolManager) {
		this._selection = selection;
		this._dragging = dragging;

		var self = this;

		// lasso visuals implementation

		/**
		* A helper that realizes the selection box visual
		*/
		var visuals = {

			create: function (context) {
				var container = canvas.getDefaultLayer(),
					frame;

				frame = context.frame = svgCreate('rect');
				svgAttr(frame, {
					class: 'djs-lasso-overlay',
					width: 1,
					height: 1,
					x: 0,
					y: 0
				});

				svgAppend(container, frame);
			},

			update: function (context) {
				var frame = context.frame,
					bbox = context.bbox;

				svgAttr(frame, {
					x: bbox.x,
					y: bbox.y,
					width: bbox.width,
					height: bbox.height
				});
			},

			remove: function (context) {

				if (context.frame) {
					svgRemove(context.frame);
				}
			}
		};

		toolManager.registerTool('lasso', {
			tool: 'lasso.selection',
			dragging: 'lasso'
		});

		eventBus.on('lasso.selection.end', function (event) {
			var target = event.originalEvent.target;

			// only reactive on diagram click
			// on some occasions, event.hover is not set and we have to check if the target is an svg
			if (!event.hover && !(target instanceof SVGElement)) {
				return;
			}

			eventBus.once('lasso.selection.ended', function () {
				self.activateLasso(event.originalEvent, true);
			});
		});

		// lasso interaction implementation

		eventBus.on('lasso.end', function (event) {

			var bbox = toBBox(event);

			var elements = elementRegistry.filter(function (element) {
				return element;
			});

			self.select(elements, bbox);
		});

		eventBus.on('lasso.start', function (event) {

			var context = event.context;

			context.bbox = toBBox(event);
			visuals.create(context);
		});

		eventBus.on('lasso.move', function (event) {

			var context = event.context;

			context.bbox = toBBox(event);
			visuals.update(context);
		});

		eventBus.on('lasso.cleanup', function (event) {

			var context = event.context;

			visuals.remove(context);
		});


		// event integration

		eventBus.on('element.mousedown', 1500, function (event): any {

			if (hasSecondaryModifier(event)) {
				self.activateLasso(event.originalEvent);

				// we've handled the event
				return true;
			}
		});
	}

	public activateLasso(event, autoActivate?) {

		this._dragging.init(event, 'lasso', {
			autoActivate: autoActivate,
			cursor: LASSO_TOOL_CURSOR,
			data: {
				context: {}
			}
		});
	};

	public activateSelection(event?) {

		this._dragging.init(event, 'lasso.selection', {
			trapClick: false,
			cursor: LASSO_TOOL_CURSOR,
			data: {
				context: {}
			}
		});
	};

	public select(elements, bbox) {
		var selectedElements = getEnclosedElements(elements, bbox);

		this._selection.select(values(selectedElements));
	};

	public toggle() {
		if (this.isActive()) {
			this._dragging.cancel();
		} else {
			this.activateSelection();
		}
	};

	public isActive() {
		var context = this._dragging.context();

		return context && /^lasso/.test(context.prefix);
	};

}

// LassoTool.$inject = [
//   'eventBus',
//   'canvas',
//   'dragging',
//   'elementRegistry',
//   'selection',
//   'toolManager'
// ];






function toBBox(event) {

	var start = {

		x: event.x - event.dx,
		y: event.y - event.dy
	};

	var end = {
		x: event.x,
		y: event.y
	};

	var bbox;

	if ((start.x <= end.x && start.y < end.y) ||
		(start.x < end.x && start.y <= end.y)) {

		bbox = {
			x: start.x,
			y: start.y,
			width: end.x - start.x,
			height: end.y - start.y
		};
	} else if ((start.x >= end.x && start.y < end.y) ||
		(start.x > end.x && start.y <= end.y)) {

		bbox = {
			x: end.x,
			y: start.y,
			width: start.x - end.x,
			height: end.y - start.y
		};
	} else if ((start.x <= end.x && start.y > end.y) ||
		(start.x < end.x && start.y >= end.y)) {

		bbox = {
			x: start.x,
			y: end.y,
			width: end.x - start.x,
			height: start.y - end.y
		};
	} else if ((start.x >= end.x && start.y > end.y) ||
		(start.x > end.x && start.y >= end.y)) {

		bbox = {
			x: end.x,
			y: end.y,
			width: start.x - end.x,
			height: start.y - end.y
		};
	} else {

		bbox = {
			x: end.x,
			y: end.y,
			width: 0,
			height: 0
		};
	}
	return bbox;
}
