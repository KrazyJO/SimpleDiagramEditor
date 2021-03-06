import {
	forEach,
	isFunction,
	isArray,
	isNumber,
	isObject
} from 'min-dash';
import EventBus from '../core/EventBus';


var DEFAULT_PRIORITY = 1000;

function unwrapEvent(fn : Function, that : any) : Function{
	return function (event : any) {
		return fn.call(that || null, event.context, event.command, event);
	};
}

/**
 * A utility that can be used to plug-in into the command execution for
 * extension and/or validation.
 *
 * @param {EventBus} eventBus
 *
 * @example
 *
 * import inherits from 'inherits';
 *
 * import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
 *
 * function CommandLogger(eventBus) {
 *   CommandInterceptor.call(this, eventBus);
 *
 *   this.preExecute(function(event) {
 *     console.log('command pre-execute', event);
 *   });
 * }
 *
 * inherits(CommandLogger, CommandInterceptor);
 *
 */

class CommandInterceptor {
	
	static $inject = ['eventBus'];
	
	private _eventBus : EventBus;


	constructor(eventBus: EventBus) {
		this._eventBus = eventBus;
	}
	
	/**
   * Register an interceptor for a command execution
   *
   * @param {String|Array<String>} [events] list of commands to register on
   * @param {String} [hook] command hook, i.e. preExecute, executed to listen on
   * @param {Number} [priority] the priority on which to hook into the execution
   * @param {Function} handlerFn interceptor to be invoked with (event)
   * @param {Boolean} unwrap if true, unwrap the event and pass (context, command, event) to the
   *                          listener instead
   * @param {Object} [that] Pass context (`this`) to the handler function
   */
	public on(events: any, hook: string, priority: any, handlerFn? : any, unwrap?: boolean, that?: any) : void {

		if (isFunction(hook) || isNumber(hook)) {
			that = unwrap;
			unwrap = handlerFn;
			handlerFn = priority;
			priority = hook;
			hook = null;
		}

		if (isFunction(priority)) {
			that = unwrap;
			unwrap = handlerFn;
			handlerFn = priority;
			priority = DEFAULT_PRIORITY;
		}

		if (isObject(unwrap)) {
			that = unwrap;
			unwrap = false;
		}

		if (!isFunction(handlerFn)) {
			throw new Error('handlerFn must be a function');
		}

		if (!isArray(events)) {
			events = [events];
		}

		var eventBus = this._eventBus;

		forEach(events, function (event : any) {
			// concat commandStack(.event)?(.hook)?
			var fullEvent = ['commandStack', event, hook].filter(function (e) { return e; }).join('.');

			eventBus.on(fullEvent, priority, unwrap ? unwrapEvent(handlerFn, that) : handlerFn, that);
		});
	}
}

// CommandInterceptor.$inject = ['eventBus'];

// export default function CommandInterceptor(eventBus : any) {

// }

var hooks : string[] = [
	'canExecute',
	'preExecute',
	'preExecuted',
	'execute',
	'executed',
	'postExecute',
	'postExecuted',
	'revert',
	'reverted'
];

/*
* Install hook shortcuts
*
* This will generate the CommandInterceptor#(preExecute|...|reverted) methods
* which will in term forward to CommandInterceptor#on.
*/
forEach(hooks, function (hook : string) {

	/**
	 * {canExecute|preExecute|preExecuted|execute|executed|postExecute|postExecuted|revert|reverted}
	 *
	 * A named hook for plugging into the command execution
	 *
	 * @param {String|Array<String>} [events] list of commands to register on
	 * @param {Number} [priority] the priority on which to hook into the execution
	 * @param {Function} handlerFn interceptor to be invoked with (event)
	 * @param {Boolean} [unwrap=false] if true, unwrap the event and pass (context, command, event) to the
	 *                          listener instead
	 * @param {Object} [that] Pass context (`this`) to the handler function
	 */
	CommandInterceptor.prototype[hook] = function (events: (string | string[]), priority: any, handlerFn: any, unwrap: boolean, that: any) {

		if (isFunction(events) || isNumber(events)) {
			that = unwrap;
			unwrap = handlerFn;
			handlerFn = priority;
			priority = events;
			events = null;
		}

		this.on(events, hook, priority, handlerFn, unwrap, that);
	};
});


// CommandInterceptor.$inject = ['eventBus'];

export default CommandInterceptor;