//---------------------IMPORTS---------------------
import { assign } from 'lodash';
import { Reader as XMLReader, Writer as XMLWriter } from 'moddle-xml';
import * as Moddle from 'moddle';

// const Ids = require('ids');

//---------------------CONSTANTS---------------------
const DEFAULT_PACKAGES: Moddle.Package[] = [
	require('../resources/easy.json'),
	require('../resources/easydi.json'),
	require('../resources/dc.json'),
	require('../resources/di.json')
];

//---------------------CLASS--------------------
export default class EasyModdle extends Moddle {

	//---------------------ATTRIBUTES---------------------
	public ids: any;

	//---------------------CONSTRUCTOR---------------------
	constructor(packages: Moddle.Package[] = DEFAULT_PACKAGES) {
		super(packages);
	}

	//---------------------METHODS---------------------
	public fromXML(xmlStr: string, typeName: string = 'ea:EasyGraph', options = {}, done: () => void = () => {}): void {
			const reader = new XMLReader(assign({model: this, lax: true}, options));
			const rootHandler = reader.handler(typeName);
			reader.fromXML(xmlStr, rootHandler, done);
	}

	public toXML(element, options = {}, done: (event: any, result?: any) => void = () => {}): void {
		const writer = new XMLWriter(options);
		try {
			const result = writer.toXML(element);
			done(null, result);
		} catch(e) {
			done(e);
		}
	}
}
