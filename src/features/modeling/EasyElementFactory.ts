//---------------------IMPORTS---------------------
import { assign } from 'lodash';
import ElementFactory from '../../diagram-ts/core/ElementFactory';

//---------------------CLASS--------------------
export default class EasyElementFactory extends ElementFactory {

	//---------------------CONSTRUCTOR---------------------
	constructor(private easyFactory, moddle) {
		super();
	}

	//---------------------METHODS---------------------
	create(elementType: string, attrs: any) {
		let size;
		let businessObject = attrs.businessObject;
		attrs = attrs || {};
		if (elementType === 'root') {
			return super.create(elementType, attrs);
		}
		if (!businessObject) {
			if (!attrs.type) {
				throw new Error('no shape type specified');
			}
			businessObject = this.easyFactory.create(attrs.type);
			if (businessObject.$instanceOf('sde:Element') && !businessObject.name) {
				const shortType = businessObject.$type.replace(/^sde\:/, '');
				businessObject.name = 'new ' + shortType;
			}
		}

		if (!businessObject.di) {
			if (elementType === 'connection') {
				businessObject.di = this.easyFactory.createDiEdge(businessObject, [], {
					id: businessObject.id + '_di'
				});
			} else if (elementType === 'shape') {
				// create meta models
				businessObject.di = this.easyFactory.createDiShape(businessObject, {}, {
					id: businessObject.id + '_di'
				});
			}
		}
		size = this._getDefaultSize(businessObject);
		attrs = assign({
			businessObject: businessObject,
			id: businessObject.id
		}, size, attrs);
		return super.create(elementType, attrs);
	}

	protected _getDefaultSize(semantic) {
		return { width: 150, height: 100 };
	}
}

(EasyElementFactory as any).$inject = ['easyFactory', 'moddle'];
