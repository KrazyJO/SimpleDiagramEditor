import { assign } from 'min-dash';

// import Refs from 'object-refs';
const Refs = require('object-refs');

var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
	labelRefs = new Refs({ name: 'label', enumerable: true }, { name: 'labelTarget' }),
	attacherRefs = new Refs({ name: 'attachers', collection: true }, { name: 'host' }),
	outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
	incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });

/**
 * @namespace djs.model
 */

/**
 * @memberOf djs.model
 */

/**
 * The basic graphical representation
 *
 * @class
 *
 * @abstract
 */
export class Base {

	constructor() {
		/**
		 * The object that backs up the shape
		 *
		 * @name Base#businessObject
		 * @type Object
		 */
		Object.defineProperty(this, 'businessObject', {
			writable: true
		});

		/**
		 * The parent shape
		 *
		 * @name Base#parent
		 * @type Shape
		 */
		parentRefs.bind(this, 'parent');

		/**
		 * @name Base#label
		 * @type Label
		 */
		labelRefs.bind(this, 'label');

		/**
		 * The list of outgoing connections
		 *
		 * @name Base#outgoing
		 * @type Array<Connection>
		 */
		outgoingRefs.bind(this, 'outgoing');

		/**
		 * The list of incoming connections
		 *
		 * @name Base#incoming
		 * @type Array<Connection>
		 */
		incomingRefs.bind(this, 'incoming');
	}

	public incoming : any;
	public outgoing : any;
	public label : any;
	public parent : any;
	public businessObject : any;
}


/**
 * A graphical object
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
export class Shape extends Base {

	public children : any;
	public host : any;
	public attachers : any;

	constructor() {
		super();
		// Base.call(this);

		/**
		 * The list of children
		 *
		 * @name Shape#children
		 * @type Array<Base>
		 */
		parentRefs.bind(this, 'children');

		/**
		 * @name Shape#host
		 * @type Shape
		 */
		attacherRefs.bind(this, 'host');

		/**
		 * @name Shape#attachers
		 * @type Shape
		 */
		attacherRefs.bind(this, 'attachers');
	}

}

// inherits(Shape, Base);


/**
 * A root graphical object
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
export class Root extends Shape {
	constructor() {
		super();
	}
}


/**
 * A label for an element
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
export class Label extends Shape {

	public labelTarget : any;

	constructor() {
		super();

		/**
		 * The labeled element
		 *
		 * @name Label#labelTarget
		 * @type Base
		 */
		labelRefs.bind(this, 'labelTarget');
	}


}

/**
 * A connection between two elements
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
export class Connection extends Base {

	public source : any;
	public target : any;

	constructor() {

		super();
		/**
	 * The element this connection originates from
	 *
	 * @name Connection#source
	 * @type Base
	 */
		outgoingRefs.bind(this, 'source');

		/**
		 * The element this connection points to
		 *
		 * @name Connection#target
		 * @type Base
		 */
		incomingRefs.bind(this, 'target');
	}



}

var types = {
	connection: Connection,
	shape: Shape,
	label: Label,
	root: Root
};

/**
 * Creates a new model element of the specified type
 *
 * @method create
 *
 * @example
 *
 * var shape1 = Model.create('shape', { x: 10, y: 10, width: 100, height: 100 });
 * var shape2 = Model.create('shape', { x: 210, y: 210, width: 100, height: 100 });
 *
 * var connection = Model.create('connection', { waypoints: [ { x: 110, y: 55 }, {x: 210, y: 55 } ] });
 *
 * @param  {String} type lower-cased model name
 * @param  {Object} attrs attributes to initialize the new model instance with
 *
 * @return {Base} the new model instance
 */

// export class create {
// 	constructor(type: string, attrs: any) {
// 		var Type = types[type];
// 		if (!Type) {
// 			throw new Error('unknown type: <' + type + '>');
// 		}
// 		return assign(new Type(), attrs);
// 	}
// }
 
export function create(type: string, attrs: any): any {
	var Type = types[type];
	if (!Type) {
		throw new Error('unknown type: <' + type + '>');
	}
	return assign(new Type(), attrs);
}