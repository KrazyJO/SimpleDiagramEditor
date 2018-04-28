import { forEach } from 'min-dash';
import Modeling from '../Modeling';
import ElementRegistry from '../../../core/ElementRegistry';


export default class DeleteElementsHandler {

	private _modeling: Modeling;
	private _elementRegistry: ElementRegistry;

	public static $inject = [
		'modeling',
		'elementRegistry'
	];

	constructor(modeling: Modeling, elementRegistry: ElementRegistry) {
		this._modeling = modeling;
		this._elementRegistry = elementRegistry;
	}

	public postExecute(context : any) : void {

		var modeling = this._modeling,
			elementRegistry = this._elementRegistry,
			elements = context.elements;
	
		forEach(elements, function (element : any) {
	
			// element may have been removed with previous
			// remove operations already (e.g. in case of nesting)
			if (!elementRegistry.get(element.id)) {
				return;
			}
	
			if (element.waypoints) {
				modeling.removeConnection(element);
			} else {
				modeling.removeShape(element);
			}
		});
	};
}