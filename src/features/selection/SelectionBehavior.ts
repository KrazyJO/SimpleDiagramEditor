import {
	hasPrimaryModifier
} from '../../util/Mouse';

import {
	find
} from 'min-dash';
import EventBus from '../../core/EventBus';
import Selection from './Selection';
import Canvas from '../../core/Canvas';
import ElementRegistry from '../../core/ElementRegistry';


export default class SelectionBehavior {


	public static $inject = [
		'eventBus',
		'selection',
		'canvas',
		'elementRegistry'
	];

	constructor(eventBus: EventBus, selection: Selection, canvas: Canvas,
		elementRegistry: ElementRegistry) {
		eventBus.on('create.end', 500, function (e: any) {

			// select the created shape after a
			// successful create operation
			if (e.context.canExecute) {
				selection.select(e.context.shape);
			}
		});

		eventBus.on('connect.end', 500, function (e: any) {

			// select the connect end target
			// after a connect operation
			if (e.context.canExecute && e.context.target) {
				selection.select(e.context.target);
			}
		});

		eventBus.on('shape.move.end', 500, function (e: any) {
			var previousSelection = e.previousSelection || [];

			var shape = elementRegistry.get(e.context.shape.id);

			// make sure at least the main moved element is being
			// selected after a move operation
			var inSelection = find(previousSelection, function (selectedShape: any) {
				return shape.id === selectedShape.id;
			});

			if (!inSelection) {
				selection.select(shape);
			}
		});

		// Shift + click selection
		eventBus.on('element.click', function (event: any) {

			var element = event.element;

			// do not select the root element
			// or connections
			if (element === canvas.getRootElement()) {
				element = null;
			}

			var isSelected = selection.isSelected(element),
				isMultiSelect = selection.get().length > 1;

			// mouse-event: SELECTION_KEY
			var add = hasPrimaryModifier(event);

			// select OR deselect element in multi selection
			if (isSelected && isMultiSelect) {
				if (add) {
					return selection.deselect(element);
				} else {
					return selection.select(element);
				}
			} else
				if (!isSelected) {
					selection.select(element, add);
				} else {
					selection.deselect(element);
				}
		});
	}
}