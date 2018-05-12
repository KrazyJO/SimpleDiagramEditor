// import {
// 	event as domEvent,
// 	closest as domClosest
// } from 'min-dom';

const {
	event,
	closest
} = require('min-dom');

import {
	getStepSize,
	cap
} from './ZoomUtil';

import {
	log10
} from '../../util/Math';

// import {
// 	bind
// } from 'min-dash';
import EventBus from '../../core/EventBus';
import Canvas from '../../core/Canvas';

var sign = Math.sign || function (n) {
	return n >= 0 ? 1 : -1;
};

var RANGE = { min: 0.2, max: 4 },
	NUM_STEPS = 10;

var DELTA_THRESHOLD = 0.1;

var DEFAULT_SCALE = 0.75;

/**
 * An implementation of zooming and scrolling within the
 * {@link Canvas} via the mouse wheel.
 *
 * Mouse wheel zooming / scrolling may be disabled using
 * the {@link toggle(enabled)} method.
 *
 * @param {Object} [config]
 * @param {Boolean} [config.enabled=true] default enabled state
 * @param {Number} [config.scale=.75] scroll sensivity
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default class ZoomScroll {

	private _canvas: Canvas;
	private _enabled: boolean;
	private _container: any;
	// private _handleWheel : any;
	private _totalDelta: number;
	private _scale: any;

	constructor(config: any, eventBus: EventBus, canvas: Canvas) {
		config = config || {};

		this._enabled = false;

		this._canvas = canvas;
		// this._container = canvas._container;
		this._container = canvas.getContainer();

		// this._handleWheel = bind(this._handleWheel, this);

		this._totalDelta = 0;
		this._scale = config.scale || DEFAULT_SCALE;

		var self = this;


		//TODO das hier geht ja ger nicht :(
		eventBus.on('canvas.init', function (e : any) {
			self._init(config.enabled !== false);
		});
	}

	static $inject = [
		'config.zoomScroll',
		'eventBus',
		'canvas'
	];

	public scroll(delta : any) : void {
		this._canvas.scroll(delta);
	};


	public reset() : void {
		this._canvas.zoom('fit-viewport');
	};

	/**
	 * Zoom depending on delta.
	 *
	 * @param {number} delta - Zoom delta.
	 * @param {Object} position - Zoom position.
	 */
	public zoom(delta: number, position: any) : void {

		// zoom with half the step size of stepZoom
		var stepSize = getStepSize(RANGE, NUM_STEPS * 2);

		// add until threshold reached
		this._totalDelta += delta;

		if (Math.abs(this._totalDelta) > DELTA_THRESHOLD) {
			this._zoom(delta, position, stepSize);

			// reset
			this._totalDelta = 0;
		}
	};


	private _handleWheel(event: any) : void {
		// event is already handled by '.djs-scrollable'
		if (closest(event.target, '.djs-scrollable', true)) {
			return;
		}

		var element = this._container;

		event.preventDefault();

		// pinch to zoom is mapped to wheel + ctrlKey = true
		// in modern browsers (!)

		var isZoom = event.ctrlKey;

		var isHorizontalScroll = event.shiftKey;

		var factor = -1 * this._scale,
			delta;

		if (isZoom) {
			factor *= event.deltaMode === 0 ? 0.020 : 0.32;
		} else {
			factor *= event.deltaMode === 0 ? 1.0 : 16.0;
		}

		if (isZoom) {
			var elementRect = element.getBoundingClientRect();

			var offset = {
				x: event.clientX - elementRect.left,
				y: event.clientY - elementRect.top
			};

			delta = (
				Math.sqrt(
					Math.pow(event.deltaY, 2) +
					Math.pow(event.deltaX, 2)
				) * sign(event.deltaY) * factor
			);

			// zoom in relative to diagram {x,y} coordinates
			this.zoom(delta, offset);
		} else {

			if (isHorizontalScroll) {
				delta = {
					dx: factor * event.deltaY,
					dy: 0
				};
			} else {
				delta = {
					dx: factor * event.deltaX,
					dy: factor * event.deltaY
				};
			}

			this.scroll(delta);
		}
	};

	/**
	 * Zoom with fixed step size.
	 *
	 * @param {number} delta - Zoom delta (1 for zooming in, -1 for out).
	 * @param {Object} position - Zoom position.
	 */
	public stepZoom(delta: number, position?: any) : void {

		var stepSize = getStepSize(RANGE, NUM_STEPS);

		this._zoom(delta, position, stepSize);
	};


	/**
	 * Zoom in/out given a step size.
	 *
	 * @param {number} delta - Zoom delta. Can be positive or negative.
	 * @param {Object} position - Zoom position.
	 * @param {number} stepSize - Step size.
	 */
	private _zoom(delta: number, position: any, stepSize: any): void {
		var canvas = this._canvas;

		var direction = delta > 0 ? 1 : -1;

		var currentLinearZoomLevel = log10(canvas.zoom());

		// snap to a proximate zoom step
		var newLinearZoomLevel = Math.round(currentLinearZoomLevel / stepSize) * stepSize;

		// increase or decrease one zoom step in the given direction
		newLinearZoomLevel += stepSize * direction;

		// calculate the absolute logarithmic zoom level based on the linear zoom level
		// (e.g. 2 for an absolute x2 zoom)
		var newLogZoomLevel = Math.pow(10, newLinearZoomLevel);

		canvas.zoom(cap(RANGE, newLogZoomLevel), position);
	};


	/**
	 * Toggle the zoom scroll ability via mouse wheel.
	 *
	 * @param  {Boolean} [newEnabled] new enabled state
	 */
	public toggle(newEnabled: boolean) : boolean {

		var element = this._container;
		var handleWheel = this._handleWheel;

		var oldEnabled = this._enabled;

		if (typeof newEnabled === 'undefined') {
			newEnabled = !oldEnabled;
		}

		// only react on actual changes
		if (oldEnabled !== newEnabled) {

			// add or remove wheel listener based on
			// changed enabled state
			event[newEnabled ? 'bind' : 'unbind'](element, 'wheel', handleWheel, false);
		}

		this._enabled = newEnabled;

		return newEnabled;
	};


	private _init(newEnabled: boolean) : void {
		this.toggle(newEnabled);
	};

}