import {
	forEach
} from 'min-dash';
import EventBus from '../../core/EventBus';
import Canvas from '../../core/Canvas';
import Selection from './Selection';
import Styles from '../../draw/Styles';

var MARKER_HOVER = 'hover',
	MARKER_SELECTED = 'selected';


/**
 * A plugin that adds a visible selection UI to shapes and connections
 * by appending the <code>hover</code> and <code>selected</code> classes to them.
 *
 * @class
 *
 * Makes elements selectable, too.
 *
 * @param {EventBus} events
 * @param {SelectionService} selection
 * @param {Canvas} canvas
 */
export default class SelectionVisuals {


	public _multiSelectionBox: any;
	public static $inject = [
		'eventBus',
		'canvas',
		'selection',
		'styles'
	];

	constructor(events: EventBus, canvas: Canvas, selection: Selection, styles: Styles) {
		this._multiSelectionBox = null;

		function addMarker(e: any, cls: any) {
			canvas.addMarker(e, cls);
		}

		function removeMarker(e: any, cls: any) {
			canvas.removeMarker(e, cls);
		}

		events.on('element.hover', function (event: any) {
			addMarker(event.element, MARKER_HOVER);
		});

		events.on('element.out', function (event: any) {
			removeMarker(event.element, MARKER_HOVER);
		});

		events.on('selection.changed', function (event: any) {

			function deselect(s: any) {
				removeMarker(s, MARKER_SELECTED);
			}

			function select(s: any) {
				addMarker(s, MARKER_SELECTED);
			}

			var oldSelection = event.oldSelection,
				newSelection = event.newSelection;

			forEach(oldSelection, function (e: any) {
				if (newSelection.indexOf(e) === -1) {
					deselect(e);
				}
			});

			forEach(newSelection, function (e: any) {
				if (oldSelection.indexOf(e) === -1) {
					select(e);
				}
			});
		});
	}
}