//---------------------IMPORTS---------------------
import Diagram from './diagram-ts/Diagram';
import { assign, omit } from 'lodash';
import { domify, query } from 'min-dom';
const Ids = require('ids');

import EasyModdle from './EasyModdle';
import { importEasyDiagram } from './import/Importer';

//---------------------CONSTANTS---------------------
// const DEFAULT_PRIORITY = 1000;
const DEFAULT_OPTIONS = {
	width: '100%',
	height: '100%',
	position: 'relative',
};
const DEFAULT_MODULES = [
	// modules the viewer is composed of
	require('./diagram-ts/features/overlays'),
	require('./diagram-ts/features/selection'),
	// non-modeling components
	require('./diagram-ts/navigation/movecanvas'),
	require('./diagram-ts/navigation/touch'),
	require('./diagram-ts/navigation/zoomscroll'),
	// modeling components
	require('./draw'),
	require('./import'),
];

//---------------------CLASS--------------------
export class Viewer extends Diagram {
	protected moddle: any;
	protected container: any;
	protected definitions: any;
	protected modules: any;

	//---------------------CONSTRUCTOR---------------------
	constructor(options?: any, modules?: any[]) {
		console.log("init Viewer");
		options = assign({}, DEFAULT_OPTIONS, options);
		super(options);

		this.modules = DEFAULT_MODULES.concat(modules);
		this.moddle = this.createModdle(options);
		this.container = this.createContainer(options);
		this.init(this.container, this.moddle, options);
	}

	getModules() {
		return this.modules;
	}

	on(event: string, priority: any, callback: Function, target: any) {
		return this.get('eventBus').on(event, priority, callback, target);
	}

	//---------------------METHODS---------------------
	importXML(xml: string, done: (err: any, warnings?: any) => void = function () { }) {
		const self = this;
		xml = this.emit('import.parse.start', { xml: xml }) || xml;
		this.moddle.fromXML(xml, 'sde:SimpleDebugEditorGraph', {}, function (err: any, definitions: any, context: any) {
			console.log('Successfully parsed!');
			definitions = self.emit('import.parse.complete', {
				error: err,
				definitions: definitions,
				context: context
			}) || definitions;
			if (err) {
				err = this.checkValidationError(err);
				self.emit('import.done', { error: err });
				return done(err);
			}
			const parseWarnings = context.warnings;
			self.importDefinitions(definitions, function (err: any, importWarnings: any) {
				const allWarnings = [].concat(parseWarnings, importWarnings || []);
				self.emit('import.done', { error: err, warnings: allWarnings });
				done(err, allWarnings);
			});
		});
	}

	importDefinitions(definitions: any, done: any) {
		try {
			if (this.definitions) {
				this.clear();
			}
			this.definitions = definitions;
			// Attention, this done need to be removed after import is implemented!!!
			done();
			importEasyDiagram(this, definitions, done);
		} catch (e) {
			done(e);
		}
	}

	protected init(container: any, moddle: any, options: any) {
		const baseModules = options.modules || this.getModules();
		const additionalModules = options.additionalModules || [];
		const staticModules: any[] = [
			{
				moddle: ['value', moddle]
			}
		];
		const diagramModules = staticModules.concat(baseModules, additionalModules);
		const diagramOptions = assign(omit(options, ['additionalModules']), {
			canvas: assign({}, options.canvas, { container: container }),
			modules: diagramModules
		});
		// invoke diagram constructor
		Diagram.call(this, diagramOptions);
		if (options && options.container) {
			this.attachTo(options.container);
		}
	}

	protected emit(type: string, event: any) {
		return this.get('eventBus').fire(type, event);
	}

	protected createModdle(options: any) {
		// this.modules = DEFAULT_MODULES;
		const moddle = new EasyModdle(options.moddleExtensions);
		moddle.ids = new Ids([32, 36, 1]);
		return moddle;
	}

	protected createContainer(options: any) {
		const container = domify('<div class="diagram-container"></div>');
		assign(container.style, {
			width: options.width,
			height: options.height,
			position: options.position
		});
		return container;
	}

	protected attachTo(parentNode: any) {
		if (!parentNode) {
			throw new Error('parentNode required');
		}
		// ensure we detach from the
		// previous, old parent
		this.detach();
		// unwrap jQuery if provided
		if (parentNode.get && parentNode.constructor.prototype.jquery) {
			parentNode = parentNode.get(0);
		}
		if (typeof parentNode === 'string') {
			parentNode = query(parentNode);
		}
		parentNode.appendChild(this.container);
		this.emit('attach', {});
		this.get('canvas').resized();
	}

	protected detach() {
		const parentNode = this.container.parentNode;
		if (!parentNode) {
			return;
		}
		this.emit('detach', {});
		parentNode.removeChild(this.container);
	}

	protected collectIds(definitions: any, context: any) {
		const moddle = definitions.$model;
		const ids: any = moddle.ids;
		ids.clear();
		for (let id of context.elementsById) {
			ids.claim(id, context.elementsById[id]);
		}
	}
}
