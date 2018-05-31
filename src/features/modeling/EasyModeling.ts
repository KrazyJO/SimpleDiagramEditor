//---------------------IMPORTS---------------------
// import Modeling = require('diagram-js/lib/features/modeling/Modeling');
import Modeling from '../../diagram-ts/features/modeling/Modeling';
// import { is } from '@utils/ModelUtil';

//---------------------CLASS--------------------
export default class EasyModeling extends Modeling {

	//---------------------CONSTRUCTOR---------------------
	constructor(eventBus, elementFactory, commandStack, private easyRules) {
		super(eventBus, elementFactory, commandStack);
	}

	//---------------------METHODS---------------------
	connect(source, target, attrs, hints) {
		if (!attrs) {
			attrs = this.easyRules.canConnect(source, target);
		}
		if (attrs) {
			return super.createConnection(source, target, attrs, source.parent, hints);
		}
		return;
	}

	removeElements(elements) {
		super.removeElements(elements);
	}
}

(Modeling as any).$inject = ['eventBus', 'elementFactory', 'commandStack', 'easyRules'];
