import {
	forEach,
	reduce
} from 'min-dash';

import {
	getChildren,
	getVisual
} from '../util/GraphicsUtil';

import { translate } from '../util/SvgTransformUtil';

import { clear as domClear } from 'min-dom';

import {
	append as svgAppend,
	attr as svgAttr,
	classes as svgClasses,
	create as svgCreate,
	remove as svgRemove
} from 'tiny-svg';
import EventBus from './EventBus';
import ElementRegistry from './ElementRegistry';


/**
 * A factory that creates graphical elements
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 */
export default class GraphicsFactory {

	static $inject = ['eventBus', 'elementRegistry'];

	private _eventBus : EventBus;
	private _elementRegistry : ElementRegistry;

	constructor(eventBus : EventBus, elementRegistry : ElementRegistry) {
		this._eventBus = eventBus;
		this._elementRegistry = elementRegistry;
	}

	private _getChildren(element : any) : any {

		var gfx = this._elementRegistry.getGraphics(element);
	
		var childrenGfx;
	
		// root element
		if (!element.parent) {
			childrenGfx = gfx;
		} else {
			childrenGfx = getChildren(gfx);
			if (!childrenGfx) {
				childrenGfx = svgCreate('g');
				svgClasses(childrenGfx).add('djs-children');
	
				svgAppend(gfx.parentNode, childrenGfx);
			}
		}
	
		return childrenGfx;
	};
	
	/**
	 * Clears the graphical representation of the element and returns the
	 * cleared visual (the <g class="djs-visual" /> element).
	 */
	private _clear(gfx : any) : any {
		var visual = getVisual(gfx);
	
		domClear(visual);
	
		return visual;
	};
	
	/**
	 * Creates a gfx container for shapes and connections
	 *
	 * The layout is as follows:
	 *
	 * <g class="djs-group">
	 *
	 *   <!-- the gfx -->
	 *   <g class="djs-element djs-(shape|connection)">
	 *     <g class="djs-visual">
	 *       <!-- the renderer draws in here -->
	 *     </g>
	 *
	 *     <!-- extensions (overlays, click box, ...) goes here
	 *   </g>
	 *
	 *   <!-- the gfx child nodes -->
	 *   <g class="djs-children"></g>
	 * </g>
	 *
	 * @param {Object} parent
	 * @param {String} type the type of the element, i.e. shape | connection
	 * @param {Number} [parentIndex] position to create container in parent
	 */
	private _createContainer(type : any, childrenGfx : any, parentIndex : number ) : void {
		var outerGfx = svgCreate('g');
		svgClasses(outerGfx).add('djs-group');
	
		// insert node at position
		if (typeof parentIndex !== 'undefined') {
			prependTo(outerGfx, childrenGfx, childrenGfx.childNodes[parentIndex]);
		} else {
			svgAppend(childrenGfx, outerGfx);
		}
	
		var gfx = svgCreate('g');
		svgClasses(gfx).add('djs-element');
		svgClasses(gfx).add('djs-' + type);
	
		svgAppend(outerGfx, gfx);
	
		// create visual
		var visual = svgCreate('g');
		svgClasses(visual).add('djs-visual');
	
		svgAppend(gfx, visual);
	
		return gfx;
	};
	
	public create(type : any, element : any, parentIndex : number) : void {
		var childrenGfx = this._getChildren(element.parent);
		return this._createContainer(type, childrenGfx, parentIndex);
	};
	
	public updateContainments(elements : any) : void {
	
		var self = this,
			elementRegistry = this._elementRegistry,
			parents;
	
		parents = reduce(elements, function (map : any, e : any) {
	
			if (e.parent) {
				map[e.parent.id] = e.parent;
			}
	
			return map;
		}, {});
	
		// update all parents of changed and reorganized their children
		// in the correct order (as indicated in our model)
		forEach(parents, function (parent : any) {
	
			var children = parent.children;
	
			if (!children) {
				return;
			}
	
			var childGfx = self._getChildren(parent);
	
			forEach(children.slice().reverse(), function (c : any) {
				var gfx = elementRegistry.getGraphics(c);
	
				prependTo(gfx.parentNode, childGfx);
			});
		});
	};
	
	public drawShape(visual : any, element : Node) : boolean | void {
		var eventBus = this._eventBus;
	
		return eventBus.fire('render.shape', { gfx: visual, element: element });
	};
	
	public getShapePath(element : Node) : boolean | void {
		var eventBus = this._eventBus;
	
		return eventBus.fire('render.getShapePath', element);
	};
	
	public drawConnection(visual : any, element : Node) : boolean | void {
		var eventBus = this._eventBus;
	
		return eventBus.fire('render.connection', { gfx: visual, element: element });
	};
	
	public getConnectionPath(waypoints : any) : boolean | void {
		var eventBus = this._eventBus;
	
		return eventBus.fire('render.getConnectionPath', waypoints);
	};
	
	public update(type : any, element : any, gfx : any) : void {
		// Do not update root element
		if (!element.parent) {
			return;
		}
	
		var visual = this._clear(gfx);
	
		// redraw
		if (type === 'shape') {
			this.drawShape(visual, element);
	
			// update positioning
			translate(gfx, element.x, element.y);
		} else
			if (type === 'connection') {
				this.drawConnection(visual, element);
			} else {
				throw new Error('unknown type: ' + type);
			}
	
		if (element.hidden) {
			svgAttr(gfx, 'display', 'none');
		} else {
			svgAttr(gfx, 'display', 'block');
		}
	};
	
	public remove(element : any) : void {
		var gfx = this._elementRegistry.getGraphics(element);
	
		// remove
		svgRemove(gfx.parentNode);
	};
	
}

// GraphicsFactory.$inject = ['eventBus', 'elementRegistry'];




// helpers //////////////////////

function prependTo(newNode : Node, parentNode : Node, siblingNode? : Node) {
	parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild);
}
