import EventBus from "../core/EventBus";

var DEFAULT_RENDER_PRIORITY = 1000;

/**
 * The base implementation of shape and connection renderers.
 *
 * @param {EventBus} eventBus
 * @param {Number} [renderPriority=1000]
 */
export default class BaseRenderer {



	constructor(eventBus: EventBus, renderPriority: number) {
		var self = this;

		renderPriority = renderPriority || DEFAULT_RENDER_PRIORITY;

		eventBus.on(['render.shape', 'render.connection'], renderPriority, function (evt: Event, context: any) {
			var type = evt.type,
				element = context.element,
				visuals = context.gfx;

			if (self.canRender(element)) {
				if (type === 'render.shape') {
					return self.drawShape(visuals, element);
				} else {
					return self.drawConnection(visuals, element);
				}
			}
		});

		eventBus.on(['render.getShapePath', 'render.getConnectionPath'], renderPriority, function (evt: Event, element: any) {
			if (self.canRender(element)) {
				if (evt.type === 'render.getShapePath') {
					return self.getShapePath(element);
				} else {
					return self.getConnectionPath(element);
				}
			}
		});
	}

	/**
	 * Should check whether *this* renderer can render
	 * the element/connection.
	 *
	 * @param {element} element
	 *
	 * @returns {Boolean}
	 */
	canRender(a : any) : any { };

	/**
	 * Provides the shape's snap svg element to be drawn on the `canvas`.
	 *
	 * @param {djs.Graphics} visuals
	 * @param {Shape} shape
	 *
	 * @returns {Snap.svg} [returns a Snap.svg paper element ]
	 */
	drawShape(a : any, b : any) { };

	/**
	 * Provides the shape's snap svg element to be drawn on the `canvas`.
	 *
	 * @param {djs.Graphics} visuals
	 * @param {Connection} connection
	 *
	 * @returns {Snap.svg} [returns a Snap.svg paper element ]
	 */
	drawConnection(a : any, b : any) : any { };

	/**
	 * Gets the SVG path of a shape that represents it's visual bounds.
	 *
	 * @param {Shape} shape
	 *
	 * @return {string} svg path
	 */
	getShapePath(a : any) { };

	/**
	 * Gets the SVG path of a connection that represents it's visual bounds.
	 *
	 * @param {Connection} connection
	 *
	 * @return {string} svg path
	 */
	getConnectionPath(a : any) { };

}

