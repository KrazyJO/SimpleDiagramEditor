import {
	forEach,
	isArray
} from 'min-dash';
import EventBus from '../../core/EventBus';
import CommandStack from '../../command/CommandStack';
import Modeling from '../modeling/Modeling';
import ZoomScroll from '../../navigation/zoomscroll/ZoomScroll';
import Canvas from '../../core/Canvas';
import Rules from '../rules/Rules';
import MouseTracking from '../mouse-tracking/MouseTracking';

var NOT_REGISTERED_ERROR = 'is not a registered action',
	IS_REGISTERED_ERROR = 'is already registered';


/**
 * An interface that provides access to modeling actions by decoupling
 * the one who requests the action to be triggered and the trigger itself.
 *
 * It's possible to add new actions by registering them with ´registerAction´ and likewise
 * unregister existing ones with ´unregisterAction´.
 *
 */
export default class EditorActions {

	private _actions: any;

	public static $inject = [
		'eventBus',
		'commandStack',
		'modeling',
		'selection',
		'zoomScroll',
		'copyPaste',
		'canvas',
		'rules',
		'mouseTracking'
	];

	constructor(eventBus: EventBus, commandStack: CommandStack, modeling: Modeling, selection: any,
		zoomScroll: ZoomScroll, copyPaste: any, canvas: Canvas, rules: Rules, mouseTracking: MouseTracking) {
		this._actions = {
			undo: function () {
				commandStack.undo();
			},
			redo: function () {
				commandStack.redo();
			},
			copy: function () {
				var selectedElements = selection.get();

				copyPaste.copy(selectedElements);
			},
			paste: function () {
				var context = mouseTracking.getHoverContext();

				copyPaste.paste(context);
			},
			stepZoom: function (opts: any) {
				zoomScroll.stepZoom(opts.value);
			},
			zoom: function (opts: any) {
				canvas.zoom(opts.value);
			},
			removeSelection: function () {
				var selectedElements = selection.get();

				if (selectedElements.length) {
					var allowed = rules.allowed('elements.delete', { elements: selectedElements }),
						removableElements;

					if (allowed === false) {
						return;
					}
					else if (isArray(allowed)) {
						removableElements = allowed;
					}
					else {
						removableElements = selectedElements;
					}

					if (removableElements.length) {
						modeling.removeElements(removableElements.slice());
					}
				}
			},
			moveCanvas: function (opts: any) {
				var dx = 0,
					dy = 0,
					invertY = opts.invertY,
					speed = opts.speed;

				var actualSpeed = speed / Math.min(Math.sqrt(canvas.viewbox().scale), 1);

				switch (opts.direction) {
					case 'left': // Left
						dx = actualSpeed;
						break;
					case 'up': // Up
						dy = actualSpeed;
						break;
					case 'right': // Right
						dx = -actualSpeed;
						break;
					case 'down': // Down
						dy = -actualSpeed;
						break;
				}

				if (dy && invertY) {
					dy = -dy;
				}

				canvas.scroll({ dx: dx, dy: dy });
			}
		};
	}
	/**
   * Triggers a registered action
   *
   * @param  {String} action
   * @param  {Object} opts
   *
   * @return {Unknown} Returns what the registered listener returns
   */
	public trigger(action: string, opts: any): any {
		if (!this._actions[action]) {
			throw error(action, NOT_REGISTERED_ERROR);
		}

		return this._actions[action](opts);
	};


	/**
	 * Registers a collections of actions.
	 * The key of the object will be the name of the action.
	 *
	 * @example
	 * ´´´
	 * var actions = {
	 *   spaceTool: function() {
	 *     spaceTool.activateSelection();
	 *   },
	 *   lassoTool: function() {
	 *     lassoTool.activateSelection();
	 *   }
	 * ];
	 *
	 * editorActions.register(actions);
	 *
	 * editorActions.isRegistered('spaceTool'); // true
	 * ´´´
	 *
	 * @param  {Object} actions
	 */
	public register(actions: any, listener: any) {
		var self = this;

		if (typeof actions === 'string') {
			return this._registerAction(actions, listener);
		}

		forEach(actions, function (listener: any, action: any) {
			self._registerAction(action, listener);
		});
	};

	/**
	 * Registers a listener to an action key
	 *
	 * @param  {String} action
	 * @param  {Function} listener
	 */
	private _registerAction(action: string, listener: Function): void {
		if (this.isRegistered(action)) {
			throw error(action, IS_REGISTERED_ERROR);
		}

		this._actions[action] = listener;
	};

	/**
	 * Unregister an existing action
	 *
	 * @param {String} action
	 */
	public unregister(action: string) {
		if (!this.isRegistered(action)) {
			throw error(action, NOT_REGISTERED_ERROR);
		}

		this._actions[action] = undefined;
	};

	/**
	 * Returns the number of actions that are currently registered
	 *
	 * @return {Number}
	 */
	public length(): number {
		return Object.keys(this._actions).length;
	};

	/**
	 * Checks wether the given action is registered
	 *
	 * @param {String} action
	 *
	 * @return {Boolean}
	 */
	public isRegistered(action: string): boolean {
		return !!this._actions[action];
	};

}



function error(action: string, message: string) {
	return new Error(action + ' ' + message);
}
