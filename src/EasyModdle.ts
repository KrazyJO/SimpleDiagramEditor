//---------------------IMPORTS---------------------
import { assign } from 'min-dash';
import { Reader as XMLReader, Writer as XMLWriter } from 'moddle-xml';
import Moddle from 'moddle';

// const Ids = require('ids');

//---------------------CONSTANTS---------------------
const DEFAULT_PACKAGES: Moddle.Package[] = [
	// require('../assets/easy.json'),
	// require('../assets/easydi.json'),
	require('../assets/dc.json'),
	require('../assets/di.json'),
	require('../assets/se.json'),
	require('../assets/sedi.json')
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
	public fromXML(xmlStr: string, typeName: string = 'sde:SimpleDebugEditorGraph', options = {}, done: () => void = () => {}): void {
			const reader = new XMLReader(assign({model: this, lax: true}, options));
			const rootHandler = reader.handler(typeName);
			reader.fromXML(xmlStr, rootHandler, done);
	}

	public toXML(element: any, options = {}, done: (event: any, result?: any) => void = () => {}): void {
		const writer = new XMLWriter(options);
		try {
			const result = writer.toXML(element);
			done(null, result);
			console.log(result);
		} catch(e) {
			done(e);
			console.error(e);
		}
	}
}
