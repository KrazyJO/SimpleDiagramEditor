/**
 * A command handler that may be registered with the
 * {@link CommandStack} via {@link CommandStack#registerHandler}.
 */
class CommandHandler {

	/**
	 * Execute changes described in the passed action context.
	 *
	 * @param {Object} context the execution context
	 *
	 * @return {Array<djs.model.Base>} list of touched (áka dirty) diagram elements
	 */
	execute(context: any) {

	}

	/**
	 * Revert changes described in the passed action context.
	 *
	 * @param {Object} context the execution context
	 *
	 * @return {Array<djs.model.Base>} list of touched (áka dirty) diagram elements
	 */
	revert(context: any) {

	}

	/**
	 * Return true if the handler may execute in the given context.
	 *
	 * @abstract
	 *
	 * @param {Object} context the execution context
	 *
	 * @return {Boolean} true if executing in the context is possible
	 */
	canExecute(context: any) {
		return true;
	};


	/**
	 * Execute actions after the actual command execution but
	 * grouped together (for undo/redo) with the action.
	 *
	 * @param {Object} context the execution context
	 */
	preExecute(context: any) {

	}

	/**
	 * Execute actions after the actual command execution but
	 * grouped together (for undo/redo) with the action.
	 *d
	 * @param {Object} context the execution context
	 */
	postExecute(context: any) {

	}
}
export default CommandHandler;