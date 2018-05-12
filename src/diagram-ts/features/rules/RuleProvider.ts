import CommandInterceptor from '../../command/CommandInterceptor';
import EventBus from '../../core/EventBus';

/**
 * A basic provider that may be extended to implement modeling rules.
 *
 * Extensions should implement the init method to actually add their custom
 * modeling checks. Checks may be added via the #addRule(action, fn) method.
 *
 * @param {EventBus} eventBus
 */
export default class RuleProvider extends CommandInterceptor {
	
	public static $inject = ['eventBus'];
	public canExecute : any;
	
	constructor(eventBus: EventBus) {
		super(eventBus);
		CommandInterceptor.call(this, eventBus);

		this.init();
	}

	/**
   * Adds a modeling rule for the given action, implemented through
   * a callback function.
   *
   * The function will receive the modeling specific action context
   * to perform its check. It must return `false` to disallow the
   * action from happening or `true` to allow the action.
   *
   * A rule provider may pass over the evaluation to lower priority
   * rules by returning return nothing (or <code>undefined</code>).
   *
   * @example
   *
   * ResizableRules.prototype.init = function() {
   *
   *   \/**
   *    * Return `true`, `false` or nothing to denote
   *    * _allowed_, _not allowed_ and _continue evaluating_.
   *    *\/
   *   this.addRule('shape.resize', function(context) {
   *
   *     var shape = context.shape;
   *
   *     if (!context.newBounds) {
   *       // check general resizability
   *       if (!shape.resizable) {
   *         return false;
   *       }
   *
   *       // not returning anything (read: undefined)
   *       // will continue the evaluation of other rules
   *       // (with lower priority)
   *       return;
   *     } else {
   *       // element must have minimum size of 10*10 points
   *       return context.newBounds.width > 10 && context.newBounds.height > 10;
   *     }
   *   });
   * };
   *
   * @param {String|Array<String>} actions the identifier for the modeling action to check
   * @param {Number} [priority] the priority at which this rule is being applied
   * @param {Function} fn the callback function that performs the actual check
   */
	public addRule(actions: string | string[], priority: any, fn?: Function) : void {

		var self = this;

		if (typeof actions === 'string') {
			actions = [actions];
		}

		actions.forEach(function (action) {

			self.canExecute(action, priority, function (context: any, action: any, event: any) {
				return fn(context);
			}, true);
		});
	}

	/**
	 * Implement this method to add new rules during provider initialization.
	 */
	public init() {

	};

};