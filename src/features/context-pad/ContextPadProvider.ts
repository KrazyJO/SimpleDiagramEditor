//---------------------IMPORTS---------------------
// import Canvas = require('diagram-js/lib/core/Canvas');
import Canvas from '../../diagram-ts/core/Canvas';
// import Connect = require('diagram-js/lib/features/connect/Connect');
import Connect from '../../diagram-ts/features/connect/Connect';
// import ContextPad = require('diagram-js/lib/features/context-pad/ContextPad');
import ContextPad from '../../diagram-ts/features/context-pad/ContextPad';
// import Create = require('diagram-js/lib/features/create/Create');
import Create from '../../diagram-ts/features/create/Create';
// import Rules = require('diagram-js/lib/features/rules/Rules');
import Rules from '../../diagram-ts/features/rules/Rules';
import { assign } from 'min-dash';

import ElementFactory from '../modeling/EasyElementFactory';
import Modeling from '../modeling/EasyModeling';
import { connectIcon, trashIcon } from '@utils/FaUtil';
import { is } from '@utils/ModelUtil';

//---------------------CLASS--------------------
class ContextPadProvider {

	// public static $inject = [
	// 	'contextPad',
	// 	'modeling',
	// 	'elementFactory',
	// 	'connect',
	// 	'create',
	// 	'canvas',
	// 	'rules',
	// ];

	//---------------------CONSTRUCTOR---------------------
	constructor(
		public contextPad: ContextPad,
		private modeling: Modeling,
		public elementFactory: ElementFactory,
		private connect: Connect,
		public create: Create,
		public canvas: Canvas,
		public rules: Rules
	) {
		contextPad.registerProvider(this);
	}

	//---------------------METHODS---------------------
	getContextPadEntries(element) {
		let actions = {};
		const businessObject = element.businessObject;
		const removeElement = event => this.modeling.removeElements([element]);
		const startConnect = (event, element, autoActivate) => this.connect.start(event, element, autoActivate);
		if (is(businessObject, 'sde:Node')) {
			assign(actions, {
				connect: {
					group: 'connect',
					className: connectIcon(),
					title: 'Connect Node together',
					action: {
						click: startConnect,
						dragstart: startConnect
					}
				}
			});
		}
		assign(actions, {
			delete: {
				group: 'edit',
				className: trashIcon(),
				title: 'Remove',
				action: {
					click: removeElement,
					dragstart: removeElement
				}
			}
		});
		return actions;
	}
}

(ContextPadProvider as any).$inject = [
	'contextPad',
	'modeling',
	'elementFactory',
	'connect',
	'create',
	'canvas',
	'rules',
];
export default ContextPadProvider;