import {
	forEach
} from 'min-dash';
import EventBus from '../../core/EventBus';

var LOW_PRIORITY = 250;

/**
 * The tool manager acts as middle-man between the available tool's and the Palette,
 * it takes care of making sure that the correct active state is set.
 *
 * @param  {Object}    eventBus
 * @param  {Object}    dragging
 */
export default class ToolManager {


	private _eventBus: EventBus;
	private _dragging: Dragging;
	private _tools: any;
	private _active: any;

	public static $inject = ['eventBus', 'dragging'];

	constructor(eventBus: EventBus, dragging: any) {
		this._eventBus = eventBus;
		this._dragging = dragging;

		this._tools = [];
		this._active = null;

	}

	public registerTool(name: string, events: any) {
		var tools = this._tools;

		if (!events) {
			throw new Error('A tool has to be registered with it\'s "events"');
		}

		tools.push(name);

		this.bindEvents(name, events);
	};

	public isActive(tool: any) {
		return tool && this._active === tool;
	};

	public length(tool: any) {
		return this._tools.length;
	};

	public setActive(tool: any) {
		var eventBus = this._eventBus;

		if (this._active !== tool) {
			this._active = tool;

			eventBus.fire('tool-manager.update', { tool: tool });
		}
	};

	public bindEvents(name: string, events: any) {
		var eventBus = this._eventBus,
			dragging = this._dragging;

		var eventsToRegister: any = [];

		eventBus.on(events.tool + '.init', function (event: any) {
			var context = event.context;

			// Active tools that want to reactivate themselves must do this explicitly
			if (!context.reactivate && this.isActive(name)) {
				this.setActive(null);

				dragging.cancel();
				return;
			}

			this.setActive(name);

		}, this);

		// Todo[ricardo]: add test cases
		forEach(events, function (event: any) {
			eventsToRegister.push(event + '.ended');
			eventsToRegister.push(event + '.canceled');
		});

		eventBus.on(eventsToRegister, LOW_PRIORITY, function (event: any) {
			var originalEvent = event.originalEvent;

			// We defer the de-activation of the tool to the .activate phase,
			// so we're able to check if we want to toggle off the current active tool or switch to a new one
			if (!this._active ||
				(originalEvent && originalEvent.target.parentNode.getAttribute('data-group') === 'tools')) {
				return;
			}

			this.setActive(null);
		}, this);
	};


}