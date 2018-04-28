import {
	isArray,
	forEach
} from 'min-dash';
import EventBus from '../../core/EventBus';


/**
 * A service that offers the current selection in a diagram.
 * Offers the api to control the selection, too.
 *
 * @class
 *
 * @param {EventBus} eventBus the event bus
 */
export default class Selection {


	public static $inject = ['eventBus'];
	private _eventBus: EventBus;
	private _selectedElements: any;

	constructor(eventBus: EventBus) {
		this._eventBus = eventBus;

		this._selectedElements = [];

		var self = this;

		eventBus.on(['shape.remove', 'connection.remove'], function (e: any) {
			var element = e.element;
			self.deselect(element);
		});

		eventBus.on(['diagram.clear'], function (e: any) {
			self.select(null);
		});
	}

	public deselect(element: any) {
		var selectedElements = this._selectedElements;

		var idx = selectedElements.indexOf(element);

		if (idx !== -1) {
			var oldSelection = selectedElements.slice();

			selectedElements.splice(idx, 1);

			this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
		}
	};


	public get() {
		return this._selectedElements;
	};

	public isSelected(element: any) {
		return this._selectedElements.indexOf(element) !== -1;
	};


	/**
	 * This method selects one or more elements on the diagram.
	 *
	 * By passing an additional add parameter you can decide whether or not the element(s)
	 * should be added to the already existing selection or not.
	 *
	 * @method Selection#select
	 *
	 * @param  {Object|Object[]} elements element or array of elements to be selected
	 * @param  {boolean} [add] whether the element(s) should be appended to the current selection, defaults to false
	 */
	public select(elements: any, add?: boolean) {
		var selectedElements = this._selectedElements,
			oldSelection = selectedElements.slice();

		if (!isArray(elements)) {
			elements = elements ? [elements] : [];
		}

		// selection may be cleared by passing an empty array or null
		// to the method
		if (add) {
			forEach(elements, function (element: any) {
				if (selectedElements.indexOf(element) !== -1) {
					// already selected
					return;
				} else {
					selectedElements.push(element);
				}
			});
		} else {
			this._selectedElements = selectedElements = elements.slice();
		}

		this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
	};

}