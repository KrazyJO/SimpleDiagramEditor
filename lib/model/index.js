var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { assign } from 'min-dash';
import Refs from 'object-refs';
var parentRefs = new Refs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }), labelRefs = new Refs({ name: 'label', enumerable: true }, { name: 'labelTarget' }), attacherRefs = new Refs({ name: 'attachers', collection: true }, { name: 'host' }), outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }), incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' });
/**
 * @namespace djs.model
 */
/**
 * @memberOf djs.model
 */
/**
 * The basic graphical representation
 *
 * @class
 *
 * @abstract
 */
var Base = /** @class */ (function () {
    function Base() {
        /**
         * The object that backs up the shape
         *
         * @name Base#businessObject
         * @type Object
         */
        Object.defineProperty(this, 'businessObject', {
            writable: true
        });
        /**
         * The parent shape
         *
         * @name Base#parent
         * @type Shape
         */
        parentRefs.bind(this, 'parent');
        /**
         * @name Base#label
         * @type Label
         */
        labelRefs.bind(this, 'label');
        /**
         * The list of outgoing connections
         *
         * @name Base#outgoing
         * @type Array<Connection>
         */
        outgoingRefs.bind(this, 'outgoing');
        /**
         * The list of incoming connections
         *
         * @name Base#incoming
         * @type Array<Connection>
         */
        incomingRefs.bind(this, 'incoming');
    }
    return Base;
}());
export { Base };
/**
 * A graphical object
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape() {
        var _this = _super.call(this) || this;
        // Base.call(this);
        /**
         * The list of children
         *
         * @name Shape#children
         * @type Array<Base>
         */
        parentRefs.bind(_this, 'children');
        /**
         * @name Shape#host
         * @type Shape
         */
        attacherRefs.bind(_this, 'host');
        /**
         * @name Shape#attachers
         * @type Shape
         */
        attacherRefs.bind(_this, 'attachers');
        return _this;
    }
    return Shape;
}(Base));
export { Shape };
// inherits(Shape, Base);
/**
 * A root graphical object
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
var Root = /** @class */ (function (_super) {
    __extends(Root, _super);
    function Root() {
        return _super.call(this) || this;
    }
    return Root;
}(Shape));
export { Root };
/**
 * A label for an element
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label() {
        var _this = _super.call(this) || this;
        /**
         * The labeled element
         *
         * @name Label#labelTarget
         * @type Base
         */
        labelRefs.bind(_this, 'labelTarget');
        return _this;
    }
    return Label;
}(Shape));
export { Label };
/**
 * A connection between two elements
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
var Connection = /** @class */ (function (_super) {
    __extends(Connection, _super);
    function Connection() {
        var _this = _super.call(this) || this;
        /**
     * The element this connection originates from
     *
     * @name Connection#source
     * @type Base
     */
        outgoingRefs.bind(_this, 'source');
        /**
         * The element this connection points to
         *
         * @name Connection#target
         * @type Base
         */
        incomingRefs.bind(_this, 'target');
        return _this;
    }
    return Connection;
}(Base));
export { Connection };
var types = {
    connection: Connection,
    shape: Shape,
    label: Label,
    root: Root
};
/**
 * Creates a new model element of the specified type
 *
 * @method create
 *
 * @example
 *
 * var shape1 = Model.create('shape', { x: 10, y: 10, width: 100, height: 100 });
 * var shape2 = Model.create('shape', { x: 210, y: 210, width: 100, height: 100 });
 *
 * var connection = Model.create('connection', { waypoints: [ { x: 110, y: 55 }, {x: 210, y: 55 } ] });
 *
 * @param  {String} type lower-cased model name
 * @param  {Object} attrs attributes to initialize the new model instance with
 *
 * @return {Base} the new model instance
 */
export function create(type, attrs) {
    var Type = types[type];
    if (!Type) {
        throw new Error('unknown type: <' + type + '>');
    }
    return assign(new Type(), attrs);
}
//# sourceMappingURL=index.js.map