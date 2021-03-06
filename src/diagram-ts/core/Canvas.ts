import {
	isNumber as isNumber,
	assign as assign,
	forEach as forEach,
	every as every,
	debounce as debounce,
	bind as bind,
	reduce as reduce
} from 'min-dash';

import {
	add as collectionAdd,
	remove as collectionRemove
} from '../util/Collections';

import {
	getType
} from '../util/Elements';
import EventBus from './EventBus';
import GraphicsFactory from './GraphicsFactory';
import ElementRegistry from './ElementRegistry';
import { Shape, Connection, Base } from '../model';

// import {
// 	append as svgAppend,
// 	attr as svgAttr,
// 	classes as svgClasses,
// 	create as svgCreate,
// 	transform as svgTransform,
// 	createMatrix as createMatrix
// } from 'tiny-svg';

const {
	append,
	attr,
	classes,
	create,
	transform,
	createMatrix
} = require('tiny-svg');

function round(number: number, resolution: number) {
	return Math.round(number * resolution) / resolution;
}

function ensurePx(number: number): any {
	return isNumber(number) ? number + 'px' : number;
}

/**
 * Creates a HTML container element for a SVG element with
 * the given configuration
 *
 * @param  {Object} options
 * @return {HTMLElement} the container element
 */
function createContainer(options: any): any {

	options = assign({}, { width: '100%', height: '100%' }, options);

	var container = options.container || document.body;

	// create a <div> around the svg element with the respective size
	// this way we can always get the correct container size
	// (this is impossible for <svg> elements at the moment)
	var parent = document.createElement('div');
	parent.setAttribute('class', 'djs-container');

	assign(parent.style, {
		position: 'relative',
		overflow: 'hidden',
		width: ensurePx(options.width),
		height: ensurePx(options.height)
	});

	container.appendChild(parent);

	return parent;
}

function createGroup(parent: any, cls: any, childIndex?: any): any {
	var group = create('g');
	classes(group).add(cls);

	var index = childIndex !== undefined ? childIndex : parent.childNodes.length - 1;

	parent.insertBefore(group, parent.childNodes[index]);

	return group;
}

var BASE_LAYER = 'base';


var REQUIRED_MODEL_ATTRS = {
	shape: ['x', 'y', 'width', 'height'],
	connection: ['waypoints']
};

function setCTM(node: any, m: any) {
	var mstr = 'matrix(' + m.a + ',' + m.b + ',' + m.c + ',' + m.d + ',' + m.e + ',' + m.f + ')';
	node.setAttribute('transform', mstr);
}

// export default 

interface cachedViewbox {
	x: number,
	y: number,
	width: number,
	height: number,
	scale?: any,
	inner?: {
		width: number,
		height: number,
		x: number,
		y: number
	},
	outer?: any
};

interface delta {
	dx: number,
	dy: number
}

interface Dimensions {
	width: number,
	height: number
}

interface Bounds {
	x: number,
	y: number,
	width: number,
	height: number
}
class Canvas {

	private _eventBus: EventBus;
	private _elementRegistry: ElementRegistry;
	private _graphicsFactory: GraphicsFactory;
	private _layers: any;
	private _cachedViewbox: cachedViewbox | null;
	private _svg: any;
	//since Dragging is reading _container, it is public...
	public _container: any;
	private _rootElement: any;
	private _viewport: any;

	static $inject = [
		'config.canvas',
		'eventBus',
		'graphicsFactory',
		'elementRegistry'
	];
	/**
	 * The main drawing canvas.
	 *
	 * @class
	 * @constructor
	 *
	 * @emits Canvas#canvas.init
	 *
	 * @param {Object} config
	 * @param {EventBus} eventBus
	 * @param {GraphicsFactory} graphicsFactory
	 * @param {ElementRegistry} elementRegistry
	 */
	constructor(config: object, eventBus: EventBus, graphicsFactory: GraphicsFactory, elementRegistry: ElementRegistry) {
		this._eventBus = eventBus;
		this._elementRegistry = elementRegistry;
		this._graphicsFactory = graphicsFactory;

		this._init(config || {});
	}

	private _init(config: any): void {

		var eventBus = this._eventBus;

		// Creates a <svg> element that is wrapped into a <div>.
		// This way we are always able to correctly figure out the size of the svg element
		// by querying the parent node.
		//
		// (It is not possible to get the size of a svg element cross browser @ 2014-04-01)
		//
		// <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
		//   <svg width="100%" height="100%">
		//    ...
		//   </svg>
		// </div>

		// html container
		var container = this._container = createContainer(config);

		var svg = this._svg = create('svg');
		attr(svg, { width: '100%', height: '100%' });

		append(container, svg);

		var viewport = this._viewport = createGroup(svg, 'viewport');

		this._layers = {};

		// debounce canvas.viewbox.changed events
		// for smoother diagram interaction
		if (config.deferUpdate !== false) {
			this._viewboxChanged = debounce(bind(this._viewboxChanged, this), 300);
		}

		eventBus.on('diagram.init', function () {

			/**
			 * An event indicating that the canvas is ready to be drawn on.
			 *
			 * @memberOf Canvas
			 *
			 * @event canvas.init
			 *
			 * @type {Object}
			 * @property {SVGElement} svg the created svg element
			 * @property {SVGElement} viewport the direct parent of diagram elements and shapes
			 */
			eventBus.fire('canvas.init', {
				svg: svg,
				viewport: viewport
			});

		}, this);

		// reset viewbox on shape changes to
		// recompute the viewbox
		eventBus.on([
			'shape.added',
			'connection.added',
			'shape.removed',
			'connection.removed',
			'elements.changed'
		], function () {
			delete this._cachedViewbox;
		}, this);

		eventBus.on('diagram.destroy', 500, this._destroy, this);
		eventBus.on('diagram.clear', 500, this._clear, this);
	}

	private _destroy(emit: any): void {
		this._eventBus.fire('canvas.destroy', {
			svg: this._svg,
			viewport: this._viewport
		});

		var parent = this._container.parentNode;

		if (parent) {
			parent.removeChild(this._container);
		}

		delete this._svg;
		delete this._container;
		delete this._layers;
		delete this._rootElement;
		delete this._viewport;
	}

	private _clear(): void {

		var self = this;

		var allElements = this._elementRegistry.getAll();

		// remove all elements
		allElements.forEach(function (element: any) {
			var type = getType(element);

			if (type === 'root') {
				self.setRootElement(null, true);
			} else {
				self._removeElement(element, type);
			}
		});

		// force recomputation of view box
		delete this._cachedViewbox;
	}


	/**
	 * Returns the default layer on which
	 * all elements are drawn.
	 *
	 * @returns {SVGElement}
	 */
	public getDefaultLayer(): any {
		return this.getLayer(BASE_LAYER, 0);
	};

	/**
 * Returns a layer that is used to draw elements
 * or annotations on it.
 *
 * Non-existing layers retrieved through this method
 * will be created. During creation, the optional index
 * may be used to create layers below or above existing layers.
 * A layer with a certain index is always created above all
 * existing layers with the same index.
 *
 * @param {String} name
 * @param {Number} index
 *
 * @returns {SVGElement}
 */
	public getLayer(name: string, index: number): SVGElement {

		if (!name) {
			throw new Error('must specify a name');
		}

		var layer = this._layers[name];

		if (!layer) {
			layer = this._layers[name] = this._createLayer(name, index);
		}

		// throw an error if layer creation / retrival is
		// requested on different index
		if (typeof index !== 'undefined' && layer.index !== index) {
			throw new Error('layer <' + name + '> already created at index <' + index + '>');
		}

		return layer.group;
	}

	/**
	 * Creates a given layer and returns it.
	 *
	 * @param {String} name
	 * @param {Number} [index=0]
	 *
	 * @return {Object} layer descriptor with { index, group: SVGGroup }
	 */
	private _createLayer(name: string, index: number): object {

		if (!index) {
			index = 0;
		}

		var childIndex = reduce(this._layers, function (childIndex: number, layer: any) {
			if (index >= layer.index) {
				childIndex++;
			}

			return childIndex;
		}, 0);

		return {
			group: createGroup(this._viewport, 'layer-' + name, childIndex),
			index: index
		};

	};

	/**
	 * Returns the html element that encloses the
	 * drawing canvas.
	 *
	 * @return {DOMNode}
	 */
	public getContainer(): any {
		return this._container;
	};

	private _updateMarker(element: any, marker: any, add: any): void {
		var container;

		if (!element.id) {
			element = this._elementRegistry.get(element);
		}

		// we need to access all
		container = this._elementRegistry._elements[element.id];

		if (!container) {
			return;
		}

		forEach([container.gfx, container.secondaryGfx], function (gfx: any) {
			if (gfx) {
				// invoke either addClass or removeClass based on mode
				if (add) {
					classes(gfx).add(marker);
				} else {
					classes(gfx).remove(marker);
				}
			}
		});

		/**
		 * An event indicating that a marker has been updated for an element
		 *
		 * @event element.marker.update
		 * @type {Object}
		 * @property {djs.model.Element} element the shape
		 * @property {Object} gfx the graphical representation of the shape
		 * @property {String} marker
		 * @property {Boolean} add true if the marker was added, false if it got removed
		 */
		this._eventBus.fire('element.marker.update', { element: element, gfx: container.gfx, marker: marker, add: !!add });
	}

	/**
	 * Adds a marker to an element (basically a css class).
	 *
	 * Fires the element.marker.update event, making it possible to
	 * integrate extension into the marker life-cycle, too.
	 *
	 * @example
	 * canvas.addMarker('foo', 'some-marker');
	 *
	 * var fooGfx = canvas.getGraphics('foo');
	 *
	 * fooGfx; // <g class="... some-marker"> ... </g>
	 *
	 * @param {String|djs.model.Base} element
	 * @param {String} marker
	 */
	public addMarker(element: Base, marker: string) {
		this._updateMarker(element, marker, true);
	};

	/**
 * Remove a marker from an element.
 *
 * Fires the element.marker.update event, making it possible to
 * integrate extension into the marker life-cycle, too.
 *
 * @param  {String|djs.model.Base} element
 * @param  {String} marker
 */
	public removeMarker(element: Base, marker: string) {
		this._updateMarker(element, marker, false);
	}

	/**
	 * Check the existence of a marker on element.
	 *
	 * @param  {String|djs.model.Base} element
	 * @param  {String} marker
	 */
	public hasMarker(element: any, marker: string) {
		if (!element.id) {
			element = this._elementRegistry.get(element);
		}

		var gfx = this.getGraphics(element);

		return classes(gfx).has(marker);
	}

	/**
	 * Toggles a marker on an element.
	 *
	 * Fires the element.marker.update event, making it possible to
	 * integrate extension into the marker life-cycle, too.
	 *
	 * @param  {String|djs.model.Base} element
	 * @param  {String} marker
	 */
	public toggleMarker(element: any, marker: string): void {
		if (this.hasMarker(element, marker)) {
			this.removeMarker(element, marker);
		} else {
			this.addMarker(element, marker);
		}
	}

	public getRootElement() {
		if (!this._rootElement) {
			this.setRootElement({ id: '__implicitroot', children: [] });
		}

		return this._rootElement;
	}



	// root element handling //////////////////////

	/**
	 * Sets a given element as the new root element for the canvas
	 * and returns the new root element.
	 *
	 * @param {Object|djs.model.Root} element
	 * @param {Boolean} [override] whether to override the current root element, if any
	 *
	 * @return {Object|djs.model.Root} new root element
	 */
	public setRootElement(element: any, override?: boolean) {

		if (element) {
			this._ensureValid('root', element);
		}

		var currentRoot = this._rootElement,
			elementRegistry = this._elementRegistry,
			eventBus = this._eventBus;

		if (currentRoot) {
			if (!override) {
				throw new Error('rootElement already set, need to specify override');
			}

			// simulate element remove event sequence
			eventBus.fire('root.remove', { element: currentRoot });
			eventBus.fire('root.removed', { element: currentRoot });

			elementRegistry.remove(currentRoot);
		}

		if (element) {
			var gfx = this.getDefaultLayer();

			// resemble element add event sequence
			eventBus.fire('root.add', { element: element });

			elementRegistry.add(element, gfx, this._svg);

			eventBus.fire('root.added', { element: element, gfx: gfx });
		}

		this._rootElement = element;

		return element;
	}



	// add functionality //////////////////////

	private _ensureValid(type: any, element: any): any {
		if (!element.id) {
			throw new Error('element must have an id');
		}

		if (this._elementRegistry.get(element.id)) {
			throw new Error('element with id ' + element.id + ' already exists');
		}

		var requiredAttrs = REQUIRED_MODEL_ATTRS[type];

		var valid = every(requiredAttrs, function (attr: string) {
			return typeof element[attr] !== 'undefined';
		});

		if (!valid) {
			throw new Error(
				'must supply { ' + requiredAttrs.join(', ') + ' } with ' + type);
		}
	}

	private _setParent(element: Base, parent: Shape, parentIndex: any): void {
		collectionAdd(parent.children, element, parentIndex);
		element.parent = parent;
	}

	/**
	 * Adds an element to the canvas.
	 *
	 * This wires the parent <-> child relationship between the element and
	 * a explicitly specified parent or an implicit root element.
	 *
	 * During add it emits the events
	 *
	 *  * <{type}.add> (element, parent)
	 *  * <{type}.added> (element, gfx)
	 *
	 * Extensions may hook into these events to perform their magic.
	 *
	 * @param {String} type
	 * @param {Object|djs.model.Base} element
	 * @param {Object|djs.model.Base} [parent]
	 * @param {Number} [parentIndex]
	 *
	 * @return {Object|djs.model.Base} the added element
	 */
	private _addElement(type: string, element: Base, parent: Shape, parentIndex: number): any {

		parent = parent || this.getRootElement();

		var eventBus = this._eventBus,
			graphicsFactory = this._graphicsFactory;

		this._ensureValid(type, element);

		eventBus.fire(type + '.add', { element: element, parent: parent });

		this._setParent(element, parent, parentIndex);

		// create graphics
		var gfx = graphicsFactory.create(type, element, parentIndex);

		this._elementRegistry.add(element, gfx);

		// update its visual
		graphicsFactory.update(type, element, gfx);

		eventBus.fire(type + '.added', { element: element, gfx: gfx });

		return element;
	}

	/**
	 * Adds a shape to the canvas
	 *
	 * @param {Object|djs.model.Shape} shape to add to the diagram
	 * @param {djs.model.Base} [parent]
	 * @param {Number} [parentIndex]
	 *
	 * @return {djs.model.Shape} the added shape
	 */
	public addShape(shape: Shape, parent: Shape, parentIndex?: number): Shape {
		return this._addElement('shape', shape, parent, parentIndex);
	}

	/**
	 * Adds a connection to the canvas
	 *
	 * @param {Object|djs.model.Connection} connection to add to the diagram
	 * @param {djs.model.Base} [parent]
	 * @param {Number} [parentIndex]
	 *
	 * @return {djs.model.Connection} the added connection
	 */
	public addConnection(connection: Connection, parent: Shape, parentIndex?: number): any {
		return this._addElement('connection', connection, parent, parentIndex);
	}


	/**
	 * Internal remove element
	 */
	private _removeElement(element: any, type: string): any {

		var elementRegistry = this._elementRegistry,
			graphicsFactory = this._graphicsFactory,
			eventBus = this._eventBus;

		element = elementRegistry.get(element.id || element);

		if (!element) {
			// element was removed already
			return;
		}

		eventBus.fire(type + '.remove', { element: element });

		graphicsFactory.remove(element);

		// unset parent <-> child relationship
		collectionRemove(element.parent && element.parent.children, element);
		element.parent = null;

		eventBus.fire(type + '.removed', { element: element });

		elementRegistry.remove(element);

		return element;
	}


	/**
	 * Removes a shape from the canvas
	 *
	 * @param {String|djs.model.Shape} shape or shape id to be removed
	 *
	 * @return {djs.model.Shape} the removed shape
	 */
	public removeShape(shape: Shape): Shape {

		/**
		 * An event indicating that a shape is about to be removed from the canvas.
		 *
		 * @memberOf Canvas
		 *
		 * @event shape.remove
		 * @type {Object}
		 * @property {djs.model.Shape} element the shape descriptor
		 * @property {Object} gfx the graphical representation of the shape
		 */

		/**
		 * An event indicating that a shape has been removed from the canvas.
		 *
		 * @memberOf Canvas
		 *
		 * @event shape.removed
		 * @type {Object}
		 * @property {djs.model.Shape} element the shape descriptor
		 * @property {Object} gfx the graphical representation of the shape
		 */
		return this._removeElement(shape, 'shape');
	}


	/**
	 * Removes a connection from the canvas
	 *
	 * @param {String|djs.model.Connection} connection or connection id to be removed
	 *
	 * @return {djs.model.Connection} the removed connection
	 */
	public removeConnection(connection: Connection) {

		/**
		 * An event indicating that a connection is about to be removed from the canvas.
		 *
		 * @memberOf Canvas
		 *
		 * @event connection.remove
		 * @type {Object}
		 * @property {djs.model.Connection} element the connection descriptor
		 * @property {Object} gfx the graphical representation of the connection
		 */

		/**
		 * An event indicating that a connection has been removed from the canvas.
		 *
		 * @memberOf Canvas
		 *
		 * @event connection.removed
		 * @type {Object}
		 * @property {djs.model.Connection} element the connection descriptor
		 * @property {Object} gfx the graphical representation of the connection
		 */
		return this._removeElement(connection, 'connection');
	}


	/**
	 * Return the graphical object underlaying a certain diagram element
	 *
	 * @param {String|djs.model.Base} element descriptor of the element
	 * @param {Boolean} [secondary=false] whether to return the secondary connected element
	 *
	 * @return {SVGElement}
	 */
	public getGraphics(element: Base, secondary?: boolean) {
		return this._elementRegistry.getGraphics(element, secondary);
	}


	/**
	 * Perform a viewbox update via a given change function.
	 *
	 * @param {Function} changeFn
	 */
	private _changeViewbox(changeFn: Function) {

		// notify others of the upcoming viewbox change
		this._eventBus.fire('canvas.viewbox.changing');

		// perform actual change
		changeFn.apply(this);

		// reset the cached viewbox so that
		// a new get operation on viewbox or zoom
		// triggers a viewbox re-computation
		this._cachedViewbox = null;

		// notify others of the change; this step
		// may or may not be debounced
		this._viewboxChanged();
	}

	private _viewboxChanged(): void {
		this._eventBus.fire('canvas.viewbox.changed', { viewbox: this.viewbox() });
	}


	/**
	 * Gets or sets the view box of the canvas, i.e. the
	 * area that is currently displayed.
	 *
	 * The getter may return a cached viewbox (if it is currently
	 * changing). To force a recomputation, pass `false` as the first argument.
	 *
	 * @example
	 *
	 * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
	 *
	 * // sets the visible area of the diagram to (100|100) -> (600|100)
	 * // and and scales it according to the diagram width
	 *
	 * var viewbox = canvas.viewbox(); // pass `false` to force recomputing the box.
	 *
	 * console.log(viewbox);
	 * // {
	 * //   inner: Dimensions,
	 * //   outer: Dimensions,
	 * //   scale,
	 * //   x, y,
	 * //   width, height
	 * // }
	 *
	 * // if the current diagram is zoomed and scrolled, you may reset it to the
	 * // default zoom via this method, too:
	 *
	 * var zoomedAndScrolledViewbox = canvas.viewbox();
	 *
	 * canvas.viewbox({
	 *   x: 0,
	 *   y: 0,
	 *   width: zoomedAndScrolledViewbox.outer.width,
	 *   height: zoomedAndScrolledViewbox.outer.height
	 * });
	 *
	 * @param  {Object} [box] the new view box to set
	 * @param  {Number} box.x the top left X coordinate of the canvas visible in view box
	 * @param  {Number} box.y the top left Y coordinate of the canvas visible in view box
	 * @param  {Number} box.width the visible width
	 * @param  {Number} box.height
	 *
	 * @return {Object} the current view box
	 */
	public viewbox(box?: cachedViewbox): cachedViewbox {

		if (box === undefined && this._cachedViewbox) {
			return this._cachedViewbox;
		}

		var viewport = this._viewport,
			innerBox,
			outerBox = this.getSize(),
			matrix,
			transform2,
			scale,
			x, y;

		if (!box) {
			// compute the inner box based on the
			// diagrams default layer. This allows us to exclude
			// external components, such as overlays
			innerBox = this.getDefaultLayer().getBBox();

			transform2 = transform(viewport);
			matrix = transform2 ? transform2.matrix : createMatrix();
			scale = round(matrix.a, 1000);

			x = round(-matrix.e || 0, 1000);
			y = round(-matrix.f || 0, 1000);

			box = this._cachedViewbox = {
				x: x ? x / scale : 0,
				y: y ? y / scale : 0,
				width: outerBox.width / scale,
				height: outerBox.height / scale,
				scale: scale,
				inner: {
					width: innerBox.width,
					height: innerBox.height,
					x: innerBox.x,
					y: innerBox.y
				},
				outer: outerBox
			};

			return box;
		} else {

			this._changeViewbox(function () {
				scale = Math.min(outerBox.width / box.width, outerBox.height / box.height);

				var matrix = this._svg.createSVGMatrix()
					.scale(scale)
					.translate(-box.x, -box.y);

				transform(viewport, matrix);
			});
		}

		return box;
	}


	/**
	 * Gets or sets the scroll of the canvas.
	 *
	 * @param {Object} [delta] the new scroll to apply.
	 *
	 * @param {Number} [delta.dx]
	 * @param {Number} [delta.dy]
	 */
	public scroll(delta: delta): object {

		var node = this._viewport;
		var matrix = node.getCTM();

		if (delta) {
			this._changeViewbox(function () {
				delta = assign({ dx: 0, dy: 0 }, delta || {});

				matrix = this._svg.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix);

				setCTM(node, matrix);
			});
		}

		return { x: matrix.e, y: matrix.f };
	}


	/**
	 * Gets or sets the current zoom of the canvas, optionally zooming
	 * to the specified position.
	 *
	 * The getter may return a cached zoom level. Call it with `false` as
	 * the first argument to force recomputation of the current level.
	 *
	 * @param {String|Number} [newScale] the new zoom level, either a number, i.e. 0.9,
	 *                                   or `fit-viewport` to adjust the size to fit the current viewport
	 * @param {String|Point} [center] the reference point { x: .., y: ..} to zoom to, 'auto' to zoom into mid or null
	 *
	 * @return {Number} the current scale
	 */
	public zoom(newScale?: any, center?: any): number {

		if (!newScale) {
			return this.viewbox(newScale).scale;
		}

		if (newScale === 'fit-viewport') {
			return this._fitViewport(center);
		}

		var outer: any,
			matrix: any;

		this._changeViewbox(function () {

			if (typeof center !== 'object') {
				outer = this.viewbox().outer;

				center = {
					x: outer.width / 2,
					y: outer.height / 2
				};
			}

			matrix = this._setZoom(newScale, center);
		}.bind(this));
		return round(matrix.a, 1000);
	};

	private _fitViewport(center: any) {

		var vbox = this.viewbox(),
			outer = vbox.outer,
			inner = vbox.inner,
			newScale,
			newViewbox;

		// display the complete diagram without zooming in.
		// instead of relying on internal zoom, we perform a
		// hard reset on the canvas viewbox to realize this
		//
		// if diagram does not need to be zoomed in, we focus it around
		// the diagram origin instead

		if (inner.x >= 0 &&
			inner.y >= 0 &&
			inner.x + inner.width <= outer.width &&
			inner.y + inner.height <= outer.height &&
			!center) {

			newViewbox = {
				x: 0,
				y: 0,
				width: Math.max(inner.width + inner.x, outer.width),
				height: Math.max(inner.height + inner.y, outer.height)
			};
		} else {

			newScale = Math.min(1, outer.width / inner.width, outer.height / inner.height);
			newViewbox = {
				x: inner.x + (center ? inner.width / 2 - outer.width / newScale / 2 : 0),
				y: inner.y + (center ? inner.height / 2 - outer.height / newScale / 2 : 0),
				width: outer.width / newScale,
				height: outer.height / newScale
			};
		}

		this.viewbox(newViewbox);

		return this.viewbox().scale;
	}


	//yes, it it used... somewhere over the rainbow... maybe by the seven dwarfts...
	_setZoom(scale: any, center: any): any {

		var svg = this._svg,
			viewport = this._viewport;

		var matrix = svg.createSVGMatrix();
		var point = svg.createSVGPoint();

		var centerPoint,
			originalPoint,
			currentMatrix,
			scaleMatrix,
			newMatrix;

		currentMatrix = viewport.getCTM();

		var currentScale = currentMatrix.a;

		if (center) {
			centerPoint = assign(point, center);

			// revert applied viewport transformations
			originalPoint = centerPoint.matrixTransform(currentMatrix.inverse());

			// create scale matrix
			scaleMatrix = matrix
				.translate(originalPoint.x, originalPoint.y)
				.scale(1 / currentScale * scale)
				.translate(-originalPoint.x, -originalPoint.y);

			newMatrix = currentMatrix.multiply(scaleMatrix);
		} else {
			newMatrix = matrix.scale(scale);
		}

		setCTM(this._viewport, newMatrix);

		return newMatrix;
	}


	/**
	 * Returns the size of the canvas
	 *
	 * @return {Dimensions}
	 */
	//just to test
	public getSize(): Dimensions {
		return {
			width: this._container.clientWidth,
			height: this._container.clientHeight
		};
	}


	/**
	 * Return the absolute bounding box for the given element
	 *
	 * The absolute bounding box may be used to display overlays in the
	 * callers (browser) coordinate system rather than the zoomed in/out
	 * canvas coordinates.
	 *
	 * @param  {ElementDescriptor} element
	 * @return {Bounds} the absolute bounding box
	 */
	public getAbsoluteBBox(element: any): Bounds {
		var vbox = this.viewbox();
		var bbox;

		// connection
		// use svg bbox
		if (element.waypoints) {
			var gfx = this.getGraphics(element);

			bbox = gfx.getBBox();
		}
		// shapes
		// use data
		else {
			bbox = element;
		}

		var x = bbox.x * vbox.scale - vbox.x * vbox.scale;
		var y = bbox.y * vbox.scale - vbox.y * vbox.scale;

		var width = bbox.width * vbox.scale;
		var height = bbox.height * vbox.scale;

		return {
			x: x,
			y: y,
			width: width,
			height: height
		};
	}

	/**
	 * Fires an event in order other modules can react to the
	 * canvas resizing
	 */
	public resized() {

		// force recomputation of view box
		delete this._cachedViewbox;

		this._eventBus.fire('canvas.resized');
	}
}

// Canvas.$inject = [
// 	'config.canvas',
// 	'eventBus',
// 	'graphicsFactory',
// 	'elementRegistry'
// ];

export default Canvas;