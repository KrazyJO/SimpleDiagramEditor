import { bind } from 'min-dash';
import EventBus from '../../core/EventBus';
import Canvas from '../../core/Canvas';


export default class MouseTracking {


	private _eventBus: EventBus;
	private _canvas: Canvas;
	private _hoverElement: any;
	private _mouseX: number;
	private _mouseY: number;

	constructor(eventBus: EventBus, canvas: Canvas) {
		this._eventBus = eventBus;
		this._canvas = canvas;

		this._init();

	}

	public static $inject = [
		'eventBus',
		'canvas'
	];


	public getHoverContext() {
		var viewbox = this._canvas.viewbox();

		return {
			element: this._hoverElement,
			point: {
				x: viewbox.x + Math.round(this._mouseX / viewbox.scale),
				y: viewbox.y + Math.round(this._mouseY / viewbox.scale)
			}
		};
	};

	private _init() {
		var eventBus = this._eventBus,
			canvas = this._canvas;

		var container = canvas.getContainer();

		this._setMousePosition = bind(this._setMousePosition, this);

		container.addEventListener('mousemove', this._setMousePosition);

		eventBus.on('diagram.destroy', function () {
			container.removeEventListener('mousemove', this._setMousePosition);
		}, this);

		eventBus.on('element.hover', this._setHoverElement, this);
	};


	private _setHoverElement(event: any) {
		this._hoverElement = event.element;
	};


	private _setMousePosition(event: any) {
		this._mouseX = event.layerX;
		this._mouseY = event.layerY;
	};


}