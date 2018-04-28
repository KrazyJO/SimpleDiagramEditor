import { forEach } from 'min-dash';
import Canvas from '../../../core/Canvas';

/**
 * A handler that align elements in a certain way.
 *
 */
export default class AlignElements {
	private _modeling: any;
	private _canvas: Canvas;

	public static $inject = ['modeling', 'canvas'];

	constructor(modeling: any, canvas: Canvas) {
		this._modeling = modeling;
		this._canvas = canvas;
	}


	public preExecute(context: any): void {
		var modeling = this._modeling;

		var elements = context.elements,
			alignment = context.alignment;


		forEach(elements, function (element: any) {
			var delta = {
				x: 0,
				y: 0
			};

			if (alignment.left) {
				delta.x = alignment.left - element.x;

			} else if (alignment.right) {
				delta.x = (alignment.right - element.width) - element.x;

			} else if (alignment.center) {
				delta.x = (alignment.center - Math.round(element.width / 2)) - element.x;

			} else if (alignment.top) {
				delta.y = alignment.top - element.y;

			} else if (alignment.bottom) {
				delta.y = (alignment.bottom - element.height) - element.y;

			} else if (alignment.middle) {
				delta.y = (alignment.middle - Math.round(element.height / 2)) - element.y;
			}

			modeling.moveElements([element], delta, element.parent);
		});
	};

	public postExecute(context: any) {

	};


}