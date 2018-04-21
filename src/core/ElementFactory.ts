import {
	create
} from '../model';

import { assign } from 'min-dash';

/**
 * A factory for diagram-js shapes
 */
export default class ElementFactory {

	_uid: number;

	constructor() {
		this._uid = 12;
	}

	public createRoot(attrs: any) {
		return this.create('root', attrs);
	};

	public createLabel(attrs: any) {
		return this.create('label', attrs);
	};

	public createShape(attrs: any) {
		return this.create('shape', attrs);
	};

	public createConnection(attrs: any) {
		return this.create('connection', attrs);
	};

	/**
	 * Create a model element with the given type and
	 * a number of pre-set attributes.
	 *
	 * @param  {String} type
	 * @param  {Object} attrs
	 * @return {djs.model.Base} the newly created model instance
	 */
	public create(type: string, attrs: any) {

		attrs = assign({}, attrs || {});

		if (!attrs.id) {
			attrs.id = type + '_' + (this._uid++);
		}

		return create(type, attrs);
	};
}


