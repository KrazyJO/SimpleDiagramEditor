import {
	isArray,
	assign,
	reduce
} from 'min-dash';


/**
 * A component that manages shape styles
 */
export default class Styles {


	public cls : Function;
	public style : Function;
	public computeStyle : Function;

	constructor() {
		var defaultTraits = {

			'no-fill': {
				fill: 'none'
			},
			'no-border': {
				strokeOpacity: 0.0
			},
			'no-events': {
				pointerEvents: 'none'
			}
		};
	
		var self = this;
	
		/**
		 * Builds a style definition from a className, a list of traits and an object of additional attributes.
		 *
		 * @param  {String} className
		 * @param  {Array<String>} traits
		 * @param  {Object} additionalAttrs
		 *
		 * @return {Object} the style defintion
		 */
		this.cls = function(className: string, traits: string[], additionalAttrs: any): any {
			var attrs = this.style(traits, additionalAttrs);
	
			return assign(attrs, { 'class': className });
		};
	
		/**
		 * Builds a style definition from a list of traits and an object of additional attributes.
		 *
		 * @param  {Array<String>} traits
		 * @param  {Object} additionalAttrs
		 *
		 * @return {Object} the style defintion
		 */
		this.style = function (traits: string[], additionalAttrs: any): any {
	
			if (!isArray(traits) && !additionalAttrs) {
				additionalAttrs = traits;
				traits = [];
			}
	
			var attrs = reduce(traits, function (attrs: any, t: any) {
				return assign(attrs, defaultTraits[t] || {});
			}, {});
	
			return additionalAttrs ? assign(attrs, additionalAttrs) : attrs;
		};
	
		this.computeStyle = function (custom: any, traits: string[], defaultStyles: any) {
			if (!isArray(traits)) {
				defaultStyles = traits;
				traits = [];
			}
	
			return self.style(traits || [], assign({}, defaultStyles, custom || {}));
		};
	}

	
}
