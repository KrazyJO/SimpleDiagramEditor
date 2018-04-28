import {
	isFunction,
	isArray,
	forEach
} from 'min-dash';

import {
	delegate as domDelegate,
	event as domEvent,
	attr as domAttr,
	query as domQuery,
	classes as domClasses,
	domify as domify
} from 'min-dom';
import EventBus from '../../core/EventBus';
import Overlays from '../overlays/Overlays';

var entrySelector = '.entry';


/**
 * A context pad that displays element specific, contextual actions next
 * to a diagram element.
 *
 * @param {EventBus} eventBus
 * @param {Overlays} overlays
 */
export default class ContextPad {

	private _providers: any;
	private _eventBus: EventBus;
	private _overlays: Overlays;
	private _current: any;
	private _overlayId : any;

	public static $inject = ['eventBus', 'overlays'];

	constructor(eventBus: EventBus, overlays: Overlays) {
		this._providers = [];

		this._eventBus = eventBus;
		this._overlays = overlays;

		this._current = null;

		this._init();

	}



	/**
	 * Registers events needed for interaction with other components
	 */
	private _init() {

		var eventBus = this._eventBus;

		var self = this;

		eventBus.on('selection.changed', function (e : any) {

			var selection = e.newSelection;

			if (selection.length === 1) {
				self.open(selection[0]);
			} else {
				self.close();
			}
		});

		eventBus.on('elements.delete', function (event : any) {
			var elements = event.elements;

			forEach(elements, function (e : any) {
				if (self.isOpen(e)) {
					self.close();
				}
			});
		});

		eventBus.on('element.changed', function (event : any) {
			var element = event.element,
				current = self._current;

			// force reopen if element for which we are currently opened changed
			if (current && current.element === element) {
				self.open(element, true);
			}
		});
	};


	/**
	 * Register a provider with the context pad
	 *
	 * @param  {ContextPadProvider} provider
	 */
	public registerProvider(provider : any) {
		this._providers.push(provider);
	};


	/**
	 * Returns the context pad entries for a given element
	 *
	 * @param {djs.element.Base} element
	 *
	 * @return {Array<ContextPadEntryDescriptor>} list of entries
	 */
	public getEntries(element : any) {
		var entries = {};

		// loop through all providers and their entries.
		// group entries by id so that overriding an entry is possible
		forEach(this._providers, function (provider : any) {
			var e = provider.getContextPadEntries(element);

			forEach(e, function (entry : any, id : any) {
				entries[id] = entry;
			});
		});

		return entries;
	};


	/**
	 * Trigger an action available on the opened context pad
	 *
	 * @param  {String} action
	 * @param  {Event} event
	 * @param  {Boolean} [autoActivate=false]
	 */
	public trigger(action : string, event : any, autoActivate? : boolean) {

		var element = this._current.element,
			entries = this._current.entries,
			entry,
			handler,
			originalEvent,
			button = event.delegateTarget || event.target;

		if (!button) {
			return event.preventDefault();
		}

		entry = entries[domAttr(button, 'data-action')];
		handler = entry.action;

		originalEvent = event.originalEvent || event;

		// simple action (via callback function)
		if (isFunction(handler)) {
			if (action === 'click') {
				return handler(originalEvent, element, autoActivate);
			}
		} else {
			if (handler[action]) {
				return handler[action](originalEvent, element, autoActivate);
			}
		}

		// silence other actions
		event.preventDefault();
	};


	/**
	 * Open the context pad for the given element
	 *
	 * @param {djs.model.Base} element
	 * @param {Boolean} force if true, force reopening the context pad
	 */
	public open(element: any, force?: boolean) {
		if (!force && this.isOpen(element)) {
			return;
		}

		this.close();
		this._updateAndOpen(element);
	};


	private _updateAndOpen(element: any) {

		var entries = this.getEntries(element),
			pad = this.getPad(element),
			html = pad.html;

		forEach(entries, function (entry: any, id: any) {
			var grouping = entry.group || 'default',
				control = domify(entry.html || '<div class="entry" draggable="true"></div>'),
				container;

			domAttr(control, 'data-action', id);

			container = domQuery('[data-group=' + grouping + ']', html);
			if (!container) {
				container = domify('<div class="group" data-group="' + grouping + '"></div>');
				html.appendChild(container);
			}

			container.appendChild(control);

			if (entry.className) {
				addClasses(control, entry.className);
			}

			if (entry.title) {
				domAttr(control, 'title', entry.title);
			}

			if (entry.imageUrl) {
				control.appendChild(domify('<img src="' + entry.imageUrl + '">'));
			}
		});

		domClasses(html).add('open');

		this._current = {
			element: element,
			pad: pad,
			entries: entries
		};

		this._eventBus.fire('contextPad.open', { current: this._current });
	};


	public getPad(element: any) {
		if (this.isOpen()) {
			return this._current.pad;
		}

		var self = this;

		var overlays = this._overlays;

		var html = domify('<div class="djs-context-pad"></div>');

		domDelegate.bind(html, entrySelector, 'click', function (event : any) {
			self.trigger('click', event);
		});

		domDelegate.bind(html, entrySelector, 'dragstart', function (event : any) {
			self.trigger('dragstart', event);
		});

		// stop propagation of mouse events
		domEvent.bind(html, 'mousedown', function (event : any) {
			event.stopPropagation();
		});

		this._overlayId = overlays.add(element, 'context-pad', {
			position: {
				right: -9,
				top: -6
			},
			html: html
		});

		var pad = overlays.get(this._overlayId);

		this._eventBus.fire('contextPad.create', { element: element, pad: pad });

		return pad;
	};


	/**
	 * Close the context pad
	 */
	public close() {
		if (!this.isOpen()) {
			return;
		}

		this._overlays.remove(this._overlayId);

		this._overlayId = null;

		this._eventBus.fire('contextPad.close', { current: this._current });

		this._current = null;
	};

	/**
	 * Check if pad is open. If element is given, will check
	 * if pad is opened with given element.
	 *
	 * @param {Element} element
	 * @return {Boolean}
	 */
	public isOpen(element? : any) : boolean {
		return !!this._current && (!element ? true : this._current.element === element);
	};



}




// helpers //////////////////////

function addClasses(element : any, classNames : any) {

	var classes = domClasses(element);

	var actualClassNames = isArray(classNames) ? classNames : classNames.split(/\s+/g);
	actualClassNames.forEach(function (cls : any) {
		classes.add(cls);
	});
}