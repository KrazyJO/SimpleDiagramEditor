//---------------------IMPORTS---------------------
import Modeling from '../../diagram-ts/features/modeling/Modeling';
// import { is } from '@utils/ModelUtil';

//---------------------CLASS--------------------
export default class EasyModeling extends Modeling {

	public static $inject = ['eventBus', 'elementFactory', 'commandStack', 'easyRules'];

	//---------------------CONSTRUCTOR---------------------
	constructor(public eventBus, public elementFactory, public commandStack, private easyRules) {
		super(eventBus, elementFactory, commandStack);
	}

	//---------------------METHODS---------------------
	connect(source, target, attrs, hints) {
		if (!attrs) {
			attrs = this.easyRules.canConnect(source, target);
		}
		if (attrs) {
			var connection = super.createConnection(source, target, attrs, source.parent, hints);
			// connection.setAttribute("sourceNode", source.businessObject.id);
			// connection
			return connection;
		}
		return;
	}

	removeElements(elements) {
		super.removeElements(elements);
	}
}