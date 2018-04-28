import MoveHelper from './helper/MoveHelper';
import Modeling from '../Modeling';


/**
 * A handler that implements reversible moving of shapes.
 */
export default class MoveElementsHandler {

	private _helper: MoveHelper;

	public static $inject = ['modeling'];

	constructor(modeling: Modeling) {
		this._helper = new MoveHelper(modeling);
	}

	public preExecute(context: any): void {
		context.closure = this._helper.getClosure(context.shapes);
	};

	public postExecute(context: any): void {

		var hints = context.hints,
			primaryShape;

		if (hints && hints.primaryShape) {
			primaryShape = hints.primaryShape;
			hints.oldParent = primaryShape.parent;
		}

		this._helper.moveClosure(
			context.closure,
			context.delta,
			context.newParent,
			context.newHost,
			primaryShape
		);
	};
}


