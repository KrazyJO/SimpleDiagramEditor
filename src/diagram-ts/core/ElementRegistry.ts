import EventBus from "./EventBus";

var ELEMENT_ID = 'data-element-id';

const { attr } = require('tiny-svg');


/**
 * @class
 *
 * A registry that keeps track of all shapes in the diagram.
 */
export default class ElementRegistry {
	
	static $inject = ['eventBus'];
	
	public  _elements: object;
	private _eventBus: EventBus;

	constructor(eventBus: EventBus) {
		this._elements = {};

		this._eventBus = eventBus;

	}

	/**
	 * Register a pair of (element, gfx, (secondaryGfx)).
	 *
	 * @param {djs.model.Base} element
	 * @param {SVGElement} gfx
	 * @param {SVGElement} [secondaryGfx] optional other element to register, too
	 */
	public add(element : any, gfx : any, secondaryGfx? : any) : void {

		var id = element.id;

		this._validateId(id);

		// associate dom node with element
		attr(gfx, ELEMENT_ID, id);

		if (secondaryGfx) {
			attr(secondaryGfx, ELEMENT_ID, id);
		}

		this._elements[id] = { element: element, gfx: gfx, secondaryGfx: secondaryGfx };
	};

	/**
	 * Removes an element from the registry.
	 *
	 * @param {djs.model.Base} element
	 */
	public remove(element : any) : void{
		var elements = this._elements,
			id = element.id || element,
			container = id && elements[id];

		if (container) {

			// unset element id on gfx
			attr(container.gfx, ELEMENT_ID, '');

			if (container.secondaryGfx) {
				attr(container.secondaryGfx, ELEMENT_ID, '');
			}

			delete elements[id];
		}
	};

	/**
	 * Update the id of an element
	 *
	 * @param {djs.model.Base} element
	 * @param {String} newId
	 */
	public updateId(element : any, newId : any) : void {

		this._validateId(newId);

		if (typeof element === 'string') {
			element = this.get(element);
		}

		this._eventBus.fire('element.updateId', {
			element: element,
			newId: newId
		});

		var gfx = this.getGraphics(element),
			secondaryGfx = this.getGraphics(element, true);

		this.remove(element);

		element.id = newId;

		this.add(element, gfx, secondaryGfx);
	};

	/**
	 * Return the model element for a given id or graphics.
	 *
	 * @example
	 *
	 * elementRegistry.get('SomeElementId_1');
	 * elementRegistry.get(gfx);
	 *
	 *
	 * @param {String|SVGElement} filter for selecting the element
	 *
	 * @return {djs.model.Base}
	 */
	public get(filter : string | SVGElement) : any {
		var id;

		if (typeof filter === 'string') {
			id = filter;
		} else {
			id = filter && attr(filter, ELEMENT_ID);
		}

		var container = this._elements[id];
		return container && container.element;
	};

	/**
	 * Return all elements that match a given filter function.
	 *
	 * @param {Function} fn
	 *
	 * @return {Array<djs.model.Base>}
	 */
	public filter(fn : Function) : any[] {

		var filtered : any[] = [];

		this.forEach(function (element : any, gfx : any) {
			if (fn(element, gfx)) {
				filtered.push(element);
			}
		});

		return filtered;
	};

	/**
	 * Return all rendered model elements.
	 *
	 * @return {Array<djs.model.Base>}
	 */
	public getAll() {
		return this.filter(function (e : any) { return e; });
	};

	/**
	 * Iterate over all diagram elements.
	 *
	 * @param {Function} fn
	 */
	public forEach(fn : Function) {

		var map = this._elements;

		Object.keys(map).forEach(function (id) {
			var container = map[id],
				element = container.element,
				gfx = container.gfx;

			return fn(element, gfx);
		});
	};

	/**
	 * Return the graphical representation of an element or its id.
	 *
	 * @example
	 * elementRegistry.getGraphics('SomeElementId_1');
	 * elementRegistry.getGraphics(rootElement); // <g ...>
	 *
	 * elementRegistry.getGraphics(rootElement, true); // <svg ...>
	 *
	 *
	 * @param {String|djs.model.Base} filter
	 * @param {Boolean} [secondary=false] whether to return the secondary connected element
	 *
	 * @return {SVGElement}
	 */
	public getGraphics(filter : any, secondary? : boolean) {
		var id = filter.id || filter;

		var container = this._elements[id];
		return container && (secondary ? container.secondaryGfx : container.gfx);
	};

	/**
	 * Validate the suitability of the given id and signals a problem
	 * with an exception.
	 *
	 * @param {String} id
	 *
	 * @throws {Error} if id is empty or already assigned
	 */
	private _validateId(id : string) : void {
		if (!id) {
			throw new Error('element must have an id');
		}

		if (this._elements[id]) {
			throw new Error('element with id ' + id + ' already added');
		}
	};

}

// ElementRegistry.$inject = ['eventBus'];

