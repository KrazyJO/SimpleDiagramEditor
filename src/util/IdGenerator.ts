/**
 * Util that provides unique IDs.
 *
 * @class djs.util.IdGenerator
 * @constructor
 * @memberOf djs.util
 *
 * The ids can be customized via a given prefix and contain a random value to avoid collisions.
 *
 * @param {String} prefix a prefix to prepend to generated ids (for better readability)
 */
export default class IdGenerator {

	private _counter : number;
	private _prefix : string;

	constructor(prefix: string) {
		this._counter = 0;
		this._prefix = (prefix ? prefix + '-' : '') + Math.floor(Math.random() * 1000000000) + '-';
	}

	/**
	 * Returns a next unique ID.
	*
	* @method djs.util.IdGenerator#next
	*
	* @returns {String} the id
	*/
	next(): string {
		return this._prefix + (++this._counter);
	};

}

