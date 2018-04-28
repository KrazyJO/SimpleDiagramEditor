import { forEach } from 'min-dash';

import {
	resizeBounds
} from '../../space-tool/SpaceUtil';
import Modeling from '../Modeling';


/**
 * A handler that implements reversible creating and removing of space.
 *
 * It executes in two phases:
 *
 *  (1) resize all affected resizeShapes
 *  (2) move all affected moveElements
 */
export default class SpaceToolHandler {

	private _modeling: Modeling;
	public static $inject = ['modeling'];

	constructor(modeling: Modeling) {
		this._modeling = modeling;

	}

	public preExecute(context : any) : void {

		// resize
		var modeling = this._modeling,
			resizingShapes = context.resizingShapes,
			delta = context.delta,
			direction = context.direction;
	
		forEach(resizingShapes, function (shape : any) {
			var newBounds = resizeBounds(shape, direction, delta);
	
			modeling.resizeShape(shape, newBounds);
		});
	};
	
	public postExecute(context : any) : void {
		// move
		var modeling = this._modeling,
			movingShapes = context.movingShapes,
			delta = context.delta;
	
		modeling.moveElements(movingShapes, delta, undefined, { autoResize: false, attach: false });
	};
	
	public execute(context : any) { };
	public revert(context : any) { };
	
}



